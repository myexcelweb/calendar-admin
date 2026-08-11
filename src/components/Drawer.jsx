export default function Drawer({ title, onClose, onSubmit, submitLabel = "Save", busy, children }) {
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-head">
          <p className="drawer-title">{title}</p>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <form
          id="drawer-form"
          className="drawer-body"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {children}
        </form>
        <div className="drawer-foot">
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" form="drawer-form" disabled={busy}>
            {busy ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </>
  );
}
