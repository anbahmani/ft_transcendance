import React from "react";
import { NavLink } from "react-router-dom";

interface SpectateGameProps {
    name: string,
}

export default function SpectateRank({name} : SpectateGameProps) : React.ReactElement {

    return (
        <NavLink to={`/RankedSpectate?name=${name}`}>
            <button className='glass-options'>Spectate Game</button>
        </NavLink>
    )
}