import { useMutation, useQuery } from '@apollo/client';
import App from './App';
import './Auth.css';
import "./game/Game.css";
import { useUser } from './lib/authHook';
import { useState, useEffect, useRef} from 'react';
import Modal from 'react-bootstrap/Modal';
import { FAValidate, updateUser } from './GraphQl/Queries';

// import ColorSchemesExample from './Nav';


function Auth() {

  console.log("AUTH RENDER");
  const authenticated = useUser();
  const [ fa, setFa ] = useState("");
  const [ redir, setRedir ] = useState(false);
  const [ log, setLog ] = useState(false);
  const [ showFa, setShowFa ] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [image, setImage] = useState(null);
  const [uploadFile] = useMutation(updateUser, {onCompleted: data => {console.log("test",data)}});
  const [validate2fa, { data, loading, error }] = useMutation(FAValidate);
  const user = JSON.parse(sessionStorage.getItem('user') as string);
  const tmp = JSON.parse(sessionStorage.getItem('tmp') as string);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const failRef = useRef<HTMLInputElement | null>(null);
  const WrongCodeRef = useRef<HTMLInputElement | null>(null);
  
  
  useEffect(() => {
    console.log("useeffect auth.tsx")
    if (user && authenticated) {
      console.log("user & authenticated 73");
      if (!user["login"])
      {
        console.log("user & authenticated 73.4");
        setLog(true);
      }
      else
        setRedir(true);
  }
  else if (tmp && !authenticated){
    console.log("user && !authenticated 80");
    console.log(tmp['isVerified'], tmp['token']);
    if (tmp['isVerified'] == true && tmp['token'] == '')
    {
      console.log("je suis al");
      setShowFa(true);
    }
    else
      setRedir(true);
}
else {
  console.log("!user 90");
}
}, [authenticated, tmp, user]);

//update image / login

const handleUpdateUser = async () => {
  if (inputRef.current)
  {
    let login = inputRef.current.value;
        if (login.length < 3)
        {
          failRef.current?.classList.remove("d-none"); // Show failure alert
          setTimeout(() => {
            failRef.current?.classList.add("d-none"); // Hide failure alert after 5 seconds
          }, 5000);
        }
        else
        {
          const res = await uploadFile({variables:{login , file : image}, context: {
            headers: {
              "Apollo-Require-Preflight": "true"
            }
          }}).then((data) => {
            sessionStorage.setItem("user", JSON.stringify(data.data?.updateUser));
            setLog(false);
            window.location.replace("/App");
            return null;
          });
          console.log('handle');
          console.log(res);
        }
      }
    }
    
    //validate 2fa code 
    const handle2Fa = async () => {
      if (tmp)
      {
        console.log("je lance la requete");
        if (fa.length != 4)
        {
          WrongCodeRef.current?.classList.remove("d-none"); // Show failure alert
        setTimeout(() => {
            failRef.current?.classList.add("d-none"); // Hide failure alert after 5 seconds
          }, 5000);
          return null;
        }
        await validate2fa({variables:{code : fa, email : tmp['email']}, context: {
          headers: {
            "Apollo-Require-Preflight": "true"
          }
        }}).then((data) => {
          if (data)
          {
            sessionStorage.removeItem('tmp');
            console.log(data.data.F2aValidate);
            sessionStorage.setItem("user", JSON.stringify(data.data.F2aValidate));
            window.location.replace("/App");
            return null;
          }
          else {
            console.log("validate2fa data null | undefined 55");
            return null;
          }
          // console.log('allala', data);
        }).catch((e) => {
          console.log("WRONG CODE");
          WrongCodeRef.current?.classList.remove("d-none"); // Show failure alert
          setTimeout(() => {
            failRef.current?.classList.add("d-none"); // Hide failure alert after 5 seconds
          }, 5000);
        });
      }
    }
    //changement image
    function handleChange(e: any) {
      if (e.target.files[0])
      {
        setImage(e.target.files[0]);
        setImageUrl(URL.createObjectURL(e.target.files[0]));
      }
    }
    
    if (redir) {
      window.location.replace("/App");
       return <>Loading...</>;
    }
    if (tmp)
    return (<>
      <div className=''>
        <Modal show={showFa} className="card fade-scale">
          <Modal.Body className="card-body">
            <Modal.Title>Bonjour {tmp ? tmp['first_name'] : "utilisateur"}</Modal.Title>
            <div>
              <div >
                <div className="mb-3">
                  <label className="form-label">Veuillez entrer le code que nous vous ont envoyer par mail :</label>
                  <input
                    type="text"
                    value={fa}
                    className="form-control"
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      const numericValue = value.replace(/\D/g, ""); // Supprimer les caractères non numériques
                      if (numericValue.length <= 4) {
                        setFa(numericValue);
                      }
                    }}
                    placeholder="XXXX"
                  />
                  <div className="alert alert-danger col-10 mx-auto mt-3 d-none" role="alert" ref={WrongCodeRef}>WRONG CODE</div>
                </div>
                <a onClick={handle2Fa} className="btn btn-primary">Valider</a>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>);
  else
    return (<>
        <div className='container rounded glass-panel pt-1'>
            <a href={"https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-c1a5e46c9b1a493e09609d825daf49c450fdd1932bbb4067386ad1dfaf46f73f&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code"}>
              <div className='test'>Start</div>
            </a>
        </div>
        {user && (<div className=''>
            <Modal show={log} className="card fade-scale">
            <Modal.Body className="card-body">
              <img className="card-img-top rounded-circle" src={user ? (imageUrl ? imageUrl : user['image']) : "https://static.vecteezy.com/system/resources/previews/011/675/374/original/man-avatar-image-for-profile-png.png"} alt="..."/>
              <Modal.Title>Bonjour {user ? user['first_name'] : "utilisateur"}</Modal.Title>
            <div>
              <div >
                <div className="mb-3">
                  <label className="form-label">Importez votre avatar :</label>
                  <input className="form-control form-control-sm" onChange={handleChange} id="formFileSm" type="file" />
                </div>
                <div className="mb-3">
                <label className="form-label">Choisissez un pseudo :</label>
                  <input type="text" className="form-control" ref={inputRef}/>
                  <div className="alert alert-danger col-10 mx-auto mt-3 d-none" role="alert" ref={failRef}>The login must have at least 3 characters</div>
                </div>
                <a onClick={handleUpdateUser} className="btn btn-primary">Valider</a>
              </div>
            </div>
            </Modal.Body>
            </Modal>
        </div>)
        }
        
    </>);
}

export default Auth