import { useLocation } from "react-router-dom";
import React from "react";

export default function DeniedAccess() : React.ReactElement {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const room : string = "room " + queryParams.get('room');

    return (
        <>
            <div className="glass-panel"
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <h3>Access denied to {room}</h3>
            </div>
        </>
    );
}