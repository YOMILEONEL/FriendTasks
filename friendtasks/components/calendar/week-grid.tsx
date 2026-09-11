"use client";

import { useState } from "react";
import { formatDayColumnLabel, todayISO } from "@/lib/utils/date";
import { TodoChip } from "@/components/calendar/todo-chip";
import { TodoModal } from "@/components/calendar/todo-modal";
import { TodoChoiceModal } from "@/components/calendar/todo-choice-modal";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import type { TodoWithRelations } from "@/lib/types/todo";
import type { Priority } from "@/lib/types/database";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const ROW_HEIGHT = "2.75rem";
const GRID_TEMPLATE_COLUMNS = "64px repeat(7, minmax(0, 1fr))";
const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

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

interface Segment {
  startLine: number;
  endLine: number;
  todos: TodoWithRelations[];
}

// Splits one day's timed todos into a true partition of the hour grid: a
// stretch covered by only one todo is its own segment (clicking it opens
// that todo directly); a stretch where two or more todos' time ranges
// actually overlap becomes its own segment showing a "+N" chooser — only
// there, not across each todo's whole span. Adjacent stretches covered by
// the exact same set of todos are merged into one segment so a plain,
// non-overlapping todo still renders as a single continuous block.
function computeDaySegments(dayTodos: TodoWithRelations[]): Segment[] {
  const withLines = dayTodos.map((todo) => {
    const startLine = timeToLine(todo.due_time!, false);
    const endLine = todo.due_time_end
      ? Math.max(timeToLine(todo.due_time_end, true), startLine + 1)
      : startLine + 1;
    return { todo, startLine, endLine };
  });

  const boundaries = [...new Set(withLines.flatMap((t) => [t.startLine, t.endLine]))].sort((a, b) => a - b);

  const raw: Segment[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const segStart = boundaries[i];
    const segEnd = boundaries[i + 1];
    const covering = withLines
      .filter((t) => t.startLine <= segStart && t.endLine >= segEnd)
      .map((t) => t.todo)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    if (covering.length === 0) continue;
    raw.push({ startLine: segStart, endLine: segEnd, todos: covering });
  }

  const merged: Segment[] = [];
  for (const seg of raw) {
    const last = merged[merged.length - 1];
    const sameCoverage =
      last &&
      last.endLine === seg.startLine &&
      last.todos.length === seg.todos.length &&
      last.todos.every((todo, i) => todo.id === seg.todos[i].id);
    if (sameCoverage) {
      last.endLine = seg.endLine;
    } else {
      merged.push(seg);
    }
  }
  return merged;
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

  // Partition each day's timed todos into segments: a stretch of time
  // covered by exactly one todo opens that todo directly on click, a
  // stretch where two or more genuinely overlap shows a "+N" chooser
  // instead — and only for that overlapping stretch, not each todo's full
  // span. See computeDaySegments.
  const segmentsByDay = new Map<number, Segment[]>();
  for (const dateISO of weekDays) {
    const dayIndex = weekDays.indexOf(dateISO);
    const dayTodos = timedTodos.filter((todo) => todo.due_date === dateISO);
    if (dayTodos.length > 0) segmentsByDay.set(dayIndex, computeDaySegments(dayTodos));
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

              {[...segmentsByDay.entries()].flatMap(([dayIndex, segments]) =>
                segments.map((segment) => {
                  const primary = segment.todos[0];
                  return (
                    <button
                      key={`${dayIndex}-${segment.startLine}-${segment.endLine}`}
                      type="button"
                      onClick={() =>
                        segment.todos.length > 1
                          ? setModal({ mode: "choose", todos: segment.todos })
                          : openEdit(primary)
                      }
                      className="relative z-10 m-px text-left"
                      style={{
                        gridColumn: dayIndex + 2,
                        gridRow: `${segment.startLine} / ${Math.min(segment.endLine, 25)}`,
                      }}
                    >
                      <TodoChip todo={primary} />
                      {segment.todos.length > 1 && (
                        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                          +{segment.todos.length - 1}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
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
