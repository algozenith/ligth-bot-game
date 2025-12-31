import React from "react";

const DraftsModal = ({ isOpen, onClose, drafts, onLoad, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div className="drafts-modal-overlay">
            <div className="drafts-modal-content">
                <div className="drafts-modal-header">
                    <h3 className="drafts-modal-title">Saved Drafts</h3>
                    <button onClick={onClose} className="drafts-modal-close">✕</button>
                </div>
                <div className="drafts-list-container">
                    {drafts.map(d => (
                        <div key={d.id} onClick={() => onLoad(d)} className="drafts-list-item">
                            <div>
                                <div className="drafts-item-name">{d.name || "Untitled Draft"}</div>
                                <div className="drafts-item-date">{new Date(d.updatedAt).toLocaleString()}</div>
                            </div>
                            <button onClick={(e) => onDelete(d.id, e)} className="btn-draft-delete">🗑️</button>
                        </div>
                    ))}
                    {drafts.length === 0 && <p className="no-drafts">No saved drafts.</p>}
                </div>
            </div>
        </div>
    );
};
export default DraftsModal;