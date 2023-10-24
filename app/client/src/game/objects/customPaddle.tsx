import React, { useState, useEffect, useRef } from 'react';

interface PaddleProps {
  up: boolean;
  down: boolean;
  pos: number;
  setpos: React.Dispatch<React.SetStateAction<number>>;
}

interface PaddlesProps {
  up: boolean;
  eup: boolean;
  down: boolean;
  edown: boolean;
  pos: number;
  epos: number;
  setpos: React.Dispatch<React.SetStateAction<number>>;
  setepos: React.Dispatch<React.SetStateAction<number>>;
}


function Paddle({up, down, pos, setpos }: PaddleProps) {
 //const [hpos, sethpos] = useState(200);
  const posRef = useRef(pos);
  
  //console.log("moving");
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {

    const interval = setInterval(() => {
//      console.log('position = ', posRef.current);

      if (up == true && posRef.current > 40) {
        setpos((prevPosition) => prevPosition - 10);
      } else if (down == true  && posRef.current < 360) {
        setpos((prevPosition) => prevPosition + 10);
      }
    }, 34);
    return () => {
      clearInterval(interval);
    };
  });
}

export function PaddleEnemy({up, down, pos, setpos }: PaddleProps) {
  //const [epos, setepos] = useState(200);
  const posRef = useRef(pos);
  
  //console.log("moving");
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {

    const interval = setInterval(() => {
//      console.log('position = ', posRef.current);

      if (up == true && posRef.current > 40) {
        setpos((prevPosition) => prevPosition - 10);
      } else if (down == true  && posRef.current < 360) {
        setpos((prevPosition) => prevPosition + 10);
      }
    }, 34);
    return () => {
      clearInterval(interval);
    };
  });
  
}


/*export function Paddles({up, eup, down, edown, pos, epos, setpos, setepos}: PaddlesProps) {

  const posRef = useRef(pos);
  const eposRef = useRef(epos);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    eposRef.current = epos;
  }, [epos]);

  useEffect(() => {

    const interval = setInterval(() => {

      if (up == true && posRef.current > 40) {
        setpos((prevPosition) => prevPosition - 10);
      } else if (down == true  && posRef.current < 360) {
        setpos((prevPosition) => prevPosition + 10);
      }

      if (eup == true && eposRef.current > 40) {
        setepos((prevPosition) => prevPosition - 10);
      } else if (edown == true  && eposRef.current < 360) {
        setepos((prevPosition) => prevPosition + 10);
      }

    }, 17);

    return () => {

      clearInterval(interval);
    };

  });
}*/

export function Paddles({
  up,
  eup,
  down,
  edown,
  pos,
  epos,
  setpos,
  setepos,
}: PaddlesProps) {

  useEffect(() => {
    const interval = setInterval(() => {
      // Update host paddle
      if (up && pos > 40) {
        setpos((prevPosition) => prevPosition - 10);
      } else if (down && pos < 350) {
        setpos((prevPosition) => prevPosition + 10);
      }

      // Update enemy paddle
      if (eup && epos > 40) {
        setepos((prevPosition) => prevPosition - 10);
      } else if (edown && epos < 350) {
        setepos((prevPosition) => prevPosition + 10);
      }
    }, 17);

    return () => {
      clearInterval(interval);
    };
  }, [up, eup, down, edown, pos, epos, setpos, setepos]);
}

export default Paddle;
