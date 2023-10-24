import React, { useState, useEffect } from 'react';

interface BallProps {

    x: number,
    y: number,
}

const gameX : number = 600;
const gameY : number = 400;

const [ scaled, setScaled ] = useState({x: 300, y: 200});

export default function ScaleBall(ball: BallProps) {

    useEffect(() => {

        const gameElement = document.querySelector('.game');
        if (gameElement) {

            const updateDimensions = () => {
                const { clientWidth, clientHeight } = gameElement;
                setScaled({x: ((ball.x / gameX) * clientWidth), y: ((ball.y / gameY) * clientHeight)});
            };

            updateDimensions();

            window.addEventListener('resize', updateDimensions);

            return () => {
                window.removeEventListener('resize', updateDimensions);
            };
        }
    });

    return scaled;
}