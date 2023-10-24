import { useEffect, useState } from "react";
import socket from "../game/socket";

interface StatusProps {
    [login: string]: string;
  }

export default function getOnlineStatus(login : string) {

    const [ statusList, setStatusList ] = useState<StatusProps | null>(null);

    useEffect(() => {

        const handleStatusList = (props: StatusProps) => {

            setStatusList(props);
        };

        socket.on('statusList', handleStatusList);

        return () => {
            socket.off('statusList, handleStatusList');
        };
    });

    if (login === null || login === undefined)
        return <></>;

    return (
        <span className={statusList ? statusList[login] : ""}></span>
    );
}