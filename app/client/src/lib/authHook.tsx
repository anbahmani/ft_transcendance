import { useQuery } from '@apollo/client';
import url from 'url';
import { useState, useEffect } from 'react';
import { AUTH_QUERY } from '../GraphQl/Queries';

export function useUser() {
  let authenticated = false;
  const currentUrl = window.location.href;
  const parsedUrl = url.parse(currentUrl, true);
  const code = parsedUrl.query.code;
  const usr = JSON.parse(sessionStorage.getItem('user') as string);
  // console.log("etape 1 user dans storage ?"+ usr);
  const {loading, error, data} = useQuery(AUTH_QUERY, {variables: {code}});
  if (usr != null)
  {

    return { user : usr, authenticated : true };
  }


  if (!data || !data.auth)
    {
      if (data) {
        if (!data.auth)
          console.log("!data.auth");
      }
      else
        console.log("!data");
      console.log("2fa on ou pb code",data);
      if (loading)
        console.log("AUTH QUERY: loading");
      if (error)
        console.log("AUTH QUERY: error: ", error.message);
    }
    else if ((!data.auth.token && data.auth.isVerified))
    {
      sessionStorage.setItem("tmp", JSON.stringify(data.auth));
      authenticated = false;
    }
    else
    {
      console.log("storage ok");
      authenticated = true;
      console.log("authhook: ", data);
      sessionStorage.setItem("user", JSON.stringify(data.auth));
    } 

  return authenticated;
}

/*
index-d3ee3d75.js:497 AUTH RENDER
index-d3ee3d75.js:463 useUSER Function
index-d3ee3d75.js:463 code =  undefined
index-d3ee3d75.js:463 !data
index-d3ee3d75.js:463 2fa on ou pb code undefined
index-d3ee3d75.js:463 AUTH QUERY: loading
index-d3ee3d75.js:497 useeffect auth.tsx
index-d3ee3d75.js:497 !user 90
index-d3ee3d75.js:497 AUTH RENDER
index-d3ee3d75.js:463 useUSER Function
index-d3ee3d75.js:463 code =  undefined
index-d3ee3d75.js:463 !data
index-d3ee3d75.js:463 2fa on ou pb code undefined
index-d3ee3d75.js:463 AUTH QUERY: error:  Unauthorized
*/

/*
index-d3ee3d75.js:497 AUTH RENDER
index-d3ee3d75.js:463 useUSER Function
index-d3ee3d75.js:463 code =  dad18faa09feae18767e45fe4abfcce808f838c79722602f140722dfddef7ad7
index-d3ee3d75.js:463 !data
index-d3ee3d75.js:463 2fa on ou pb code undefined
index-d3ee3d75.js:463 AUTH QUERY: loading
index-d3ee3d75.js:497 useeffect auth.tsx
index-d3ee3d75.js:497 !user 90
index-d3ee3d75.js:497 AUTH RENDER
index-d3ee3d75.js:463 useUSER Function
index-d3ee3d75.js:463 code =  dad18faa09feae18767e45fe4abfcce808f838c79722602f140722dfddef7ad7
index-d3ee3d75.js:463 !data
index-d3ee3d75.js:463 2fa on ou pb code undefined
index-d3ee3d75.js:463 AUTH QUERY: error:  Request failed with status code 401
*/