import React from "react";

const Popup = ({ message, type, onConfirm, onCancel }) => (
    <div className="popup-overlay" onClick={onCancel}>
        <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <p className="popup-message">{message}</p>
            <div className="popup-actions">
                {type === "confirm" ? (
                    <>
                        <button className="btn-popup cancel" onClick={onCancel}>Cancel</button>
                        <button className="btn-popup confirm" onClick={onConfirm}>Confirm</button>
                    </>
                ) : (
                    <button className="btn-popup alert" onClick={onCancel}>OK</button>
                )}
            </div>
        </div>
    </div>
);
export default Popup;