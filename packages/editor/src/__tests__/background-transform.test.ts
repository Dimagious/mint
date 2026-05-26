import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore, __resetHistoryForTests } from '../store/editor-store';

describe('setBackgroundTransform', () => {
  beforeEach(() => {
    __resetHistoryForTests();
    useEditorStore.getState().loadDocument({
      ...useEditorStore.getState().document,
      background: {
        ...useEditorStore.getState().document.background,
        manual: null,
      },
    });
  });

  it('persists a manual transform on the document', () => {
    useEditorStore
      .getState()
      .setBackgroundTransform({ x: 12, y: 34, scale: 1.5 });
    expect(useEditorStore.getState().document.background.manual).toEqual({
      x: 12,
      y: 34,
      scale: 1.5,
    });
  });

  it('clears the manual transform when passed null (Reset)', () => {
    const store = useEditorStore.getState();
    store.setBackgroundTransform({ x: 5, y: 5, scale: 2 });
    store.setBackgroundTransform(null);
    expect(useEditorStore.getState().document.background.manual).toBeNull();
  });

  it('routes through history so undo restores the prior transform', () => {
    const store = useEditorStore.getState();
    store.setBackgroundTransform({ x: 10, y: 10, scale: 1 });
    store.setBackgroundTransform({ x: 99, y: 99, scale: 2 });

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().document.background.manual).toEqual({
      x: 10,
      y: 10,
      scale: 1,
    });
  });
});
