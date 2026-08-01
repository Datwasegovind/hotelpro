export default function Modal({ show, title, onClose, children, footer, size }) {
  if (!show) return null;
  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(11,11,12,0.55)" }}>
      <div className={`modal-dialog modal-dialog-centered ${size ? `modal-${size}` : ""}`}>
        <div className="modal-content" style={{ borderRadius: "2px", border: "1px solid var(--ivory-dim)" }}>
          <div className="modal-header">
            <h5 className="modal-title display" style={{ fontSize: "1.15rem" }}>{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
