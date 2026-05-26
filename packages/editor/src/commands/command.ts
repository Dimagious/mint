import type { EditorDocument } from '@mint/core';

export interface Command {
  execute(doc: EditorDocument): EditorDocument;
  undo(doc: EditorDocument): EditorDocument;
  readonly description: string;
  /**
   * Optional: a chance to absorb a newer command into the previous one.
   *
   * Called by `CommandHistory.execute` with the **new** command and the
   * number of milliseconds that elapsed since the previous command's
   * touched-at moment (the history owns the clock so individual commands
   * stay testable without monkey-patching Date.now()).
   *
   * If the returned value is true, the new command is treated as fully
   * merged into `this` and is not pushed to the undo stack; the doc
   * still reflects the new command's `execute()` result because that
   * already ran before `tryCoalesce` was consulted.
   *
   * Implementations should be conservative: only coalesce semantically
   * adjacent commands (e.g. the same field on the same layer within a few
   * hundred ms) so undo still feels atomic to the user.
   */
  tryCoalesce?(next: Command, elapsedMs: number): boolean;
}
