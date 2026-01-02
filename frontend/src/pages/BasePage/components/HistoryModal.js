import React from "react";
import HistoryCard from "./HistoryCard";
import "./HistoryModal.css";

const HistoryModal = ({ isOpen, onClose, history, onRestore, onUpdateName }) => {
    if (!isOpen) return null;

    return (
        <div className="drafts-modal-overlay">
            <div className="history-modal-content">
                <div className="history-modal-header">
                    <h3 className="history-modal-title">Submission History</h3>
                    <button onClick={onClose} className="drafts-modal-close">✕</button>
                </div>
                <div className="history-grid-container">
                    {history.map(entry => (
                        <HistoryCard 
                            key={entry.id} 
                            entry={entry} 
                            onDeploy={onRestore} 
                            onUpdateName={onUpdateName}
                        />
                    ))}
                    {history.length === 0 && <p className="no-drafts">No submission history found.</p>}
                </div>
            </div>
        </div>
    );
};
export default HistoryModal;