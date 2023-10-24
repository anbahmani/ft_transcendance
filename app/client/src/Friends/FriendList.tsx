import React from "react";

interface Props {
    joinedUsers: any;
    setProfile: React.Dispatch<any>;
    count: number;
}

export default function Friendlist({joinedUsers, setProfile, count}: Props) : React.ReactElement {


    const func = ({user, status, fid, option}: any) => {

        setProfile((prevProfile : any)=> ({
          ...prevProfile,
          user: user,
          status: status,
          fid: fid,
          option: option,
        }));
      }

    return (
    <div className='friendlist'>
                    <div>
                        <ul>
                          {joinedUsers !== null && joinedUsers !== undefined && joinedUsers.map((item: any) => (
                            item !== null && item !== undefined && (
                          <li onClick={() => func({user: item.user, status: item.status, fid: item.fid, option: item.option, connect: item.connect})} 
                            key={item.user.id} className={item.option === "choose" ? 'rec' : 'friend'}>
                              <span className={item.connect === undefined ? "Disconnected" : item.connect}></span>
                              {item.user.login42} {item.option === "choose" ? " - Pending" : ""}
                          </li>
                            )
                          ))}
                        </ul>
                    </div>
                </div>
    );
}