"use client";

import { useState } from "react";
import { formatDayColumnLabel, todayISO } from "@/lib/utils/date";
import { TodoChip } from "@/components/calendar/todo-chip";
import { TodoModal } from "@/components/calendar/todo-modal";
import { TodoChoiceModal } from "@/components/calendar/todo-choice-modal";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import type { TodoWithRelations } from "@/lib/types/todo";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const ROW_HEIGHT = "2.75rem";
const GRID_TEMPLATE_COLUMNS = "64px repeat(7, minmax(0, 1fr))";

type ModalState =
  | { mode: "create"; date: string; time?: string }
  | { mode: "edit"; todo: TodoWithRelations }
  | { mode: "choose"; todos: TodoWithRelations[] }
  | null;

// Grid row lines are 1-indexed; line N is the top edge of the row for hour
// N-1. Minutes are ignored for the start line (blocks snap to the hour they
// start in) but a non-zero end minute extends the block into the next row
// so a task ending at, say, 11:30 visibly covers part of the 11:00 row.
function timeToLine(time: string, roundUp: boolean): number {
  const hour = Number(time.slice(0, 2));
  const minute = Number(time.slice(3, 5));
  return hour + 1 + (roundUp && minute > 0 ? 1 : 0);
}

export function WeekGrid({
  weekDays,
  todos,
}: {
  weekDays: string[];
  todos: TodoWithRelations[];
}) {
  const [modal, setModal] = useState<ModalState>(null);
  const today = todayISO();
  const t = useT();
  const locale = useLocale();

  const allDayByDay = new Map<string, TodoWithRelations[]>();
  const timedTodos: TodoWithRelations[] = [];

  for (const todo of todos) {
    if (!todo.due_date) continue;
    if (!todo.due_time) {
      const list = allDayByDay.get(todo.due_date) ?? [];
      list.push(todo);
      allDayByDay.set(todo.due_date, list);
    } else {
      timedTodos.push(todo);
    }
  }

  function openCreate(date: string, time?: string) {
    setModal({ mode: "create", date, time });
  }

  function openEdit(todo: TodoWithRelations) {
    setModal({ mode: "edit", todo });
  }

  // Groups todos sharing the same day + start hour, so overlapping entries
  // render as one stacked chip with a chooser instead of silently hiding
  // each other in the same grid cell.
  const timedGroups = new Map<string, TodoWithRelations[]>();
  for (const todo of timedTodos) {
    const dayIndex = weekDays.indexOf(todo.due_date!);
    if (dayIndex === -1) continue;
    const startLine = timeToLine(todo.due_time!, false);
    const key = `${dayIndex}-${startLine}`;
    const list = timedGroups.get(key) ?? [];
    list.push(todo);
    timedGroups.set(key, list);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      {/* Horizontal scroll on narrow screens: the three sections below share
          this one scroll container (and the same min-width) so day headers,
          the all-day row and the hour grid always stay column-aligned. */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div
            className="grid border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
            style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
          >
            <div />
            {weekDays.map((dateISO) => {
              const isToday = dateISO === today;
              return (
                <button
                  key={dateISO}
                  type="button"
                  onClick={() => openCreate(dateISO)}
                  className="flex items-center justify-center gap-1.5 border-l border-zinc-200 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <span
                    className={
                      isToday
                        ? "flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs text-white"
                        : ""
                    }
                  >
                    {formatDayColumnLabel(dateISO, locale)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* All-day row */}
          <div
            className="grid border-b border-zinc-200 dark:border-zinc-800"
            style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
          >
            <div className="flex items-center justify-end px-2 py-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
              {t("calendar.allDay")}
            </div>
            {weekDays.map((dateISO) => (
              <button
                key={dateISO}
                type="button"
                onClick={() => openCreate(dateISO)}
                className="space-y-0.5 border-l border-zinc-200 p-1 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                {(allDayByDay.get(dateISO) ?? []).map((todo) => (
                  <div
                    key={todo.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(todo);
                    }}
                  >
                    <TodoChip todo={todo} />
                  </div>
                ))}
              </button>
            ))}
          </div>

          {/* Hour grid: one unified CSS grid so timed todos can span multiple
              hour rows as a single continuous block. */}
          <div className="relative max-h-[70vh] overflow-y-auto">
            <div
              className="grid"
              style={{
                gridTemplateColumns: GRID_TEMPLATE_COLUMNS,
                gridTemplateRows: `repeat(24, ${ROW_HEIGHT})`,
              }}
            >
              {HOURS.map((hour) => (
                <div
                  key={`label-${hour}`}
                  className="border-b border-zinc-100 px-2 py-1 text-right text-[11px] text-zinc-400 dark:border-zinc-900 dark:text-zinc-500"
                  style={{ gridColumn: 1, gridRow: hour + 1 }}
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}

              {weekDays.map((dateISO, dayIndex) =>
                HOURS.map((hour) => (
                  <button
                    key={`${dateISO}-${hour}`}
                    type="button"
                    onClick={() => openCreate(dateISO, `${String(hour).padStart(2, "0")}:00`)}
                    className="border-b border-l border-zinc-100 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900"
                    style={{ gridColumn: dayIndex + 2, gridRow: hour + 1 }}
                  />
                ))
              )}

              {[...timedGroups.entries()].map(([key, group]) => {
                const [dayIndexStr, startLineStr] = key.split("-");
                const dayIndex = Number(dayIndexStr);
                const startLine = Number(startLineStr);
                const endLine = Math.max(
                  ...group.map((todo) =>
                    todo.due_time_end
                      ? Math.max(timeToLine(todo.due_time_end, true), startLine + 1)
                      : startLine + 1
                  )
                );
                const primary = group[0];

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      group.length > 1 ? setModal({ mode: "choose", todos: group }) : openEdit(primary)
                    }
                    className="relative z-10 m-px text-left"
                    style={{
                      gridColumn: dayIndex + 2,
                      gridRow: `${startLine} / ${Math.min(endLine, 25)}`,
                    }}
                  >
                    <TodoChip todo={primary} />
                    {group.length > 1 && (
                      <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                        +{group.length - 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {modal?.mode === "create" && (
        <TodoModal date={modal.date} time={modal.time} onClose={() => setModal(null)} />
      )}
      {modal?.mode === "edit" && (
        <TodoModal date={modal.todo.due_date!} todo={modal.todo} onClose={() => setModal(null)} />
      )}
      {modal?.mode === "choose" && (
        <TodoChoiceModal
          todos={modal.todos}
          onSelect={(todo) => setModal({ mode: "edit", todo })}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
