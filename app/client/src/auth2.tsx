import url from 'url';
import './Auth.css';
import { AUTH_QUERY, FAValidate, updateUser } from './GraphQl/Queries';
import { useMutation, useQuery } from '@apollo/client';
import Modal from 'react-bootstrap/Modal';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./game/Game.css";

function Auth() {

  const currentUrl = window.location.href;
  const parsedUrl = url.parse(currentUrl, true);
  const code = parsedUrl.query.code;
  const [show, setShow] = useState(false);
  const [showFa, setShowFa] = useState(false);

  const {data} = useQuery(AUTH_QUERY, {variables: {code}});
  const [log, setLog] = useState(false);
  const [login, setLogin] = useState("");
  const [faCode, setFaCode] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadFile] = useMutation(updateUser, {onCompleted: data => {console.log("test",data)}});
  const navigate = useNavigate();

  function handleChange(e: any) {
    if (e.target.files[0])
    {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  }

  useEffect(() => {
    console.log(data);
    if (data && data['auth'] && data['auth']['token'])
      navigate("/App");
    setLog(true);
  }, [data]);
  
  if (code && data && show == false && log)
  {
    if (data && data['auth'] && !data['auth']['token'])
      setShowFa(true);
    else if (data && data['auth'] && !data['auth']['login'])
    {
      setShow(true);
      setLog(false);
    }
  }

  const handleUpdateUser = async () =>
  {
      const res = await uploadFile({variables:{login, file : image}, context: {
        headers: {
            "Apollo-Require-Preflight": "true"
        }
      }}).then(() => {
        setShow(false);
        navigate("/App");
      });
      console.log(res);
  }

  const handle2Fa = async () =>
  {
    const {} = useQuery(FAValidate, {variables:{'code' : faCode, 'email' : data['auth']['email']},
    onCompleted: data2 => {
      if (data2['auth']['token'])
      {
        setShowFa(false);
        navigate("/App");
      };
    }});
  }

  return (
    <>
      

      <div className=''>
          <Modal show={show} className="card fade-scale">
          <Modal.Body className="card-body">
            <img className="card-img-top rounded-circle" src={data ? (imageUrl ? imageUrl : data['auth']['image']) : "https://static.vecteezy.com/system/resources/previews/011/675/374/original/man-avatar-image-for-profile-png.png"} alt="..."/>
            <Modal.Title>Bonjour {data ? data['auth']['first_name'] : "utilisateur"}</Modal.Title>
          <div>
            <div >
              <div className="mb-3">
                <label className="form-label">Importez votre avatar :</label>
                <input className="form-control form-control-sm" onChange={handleChange} id="formFileSm" type="file" />
              </div>
              <div className="mb-3">
              <label className="form-label">Choisissez un pseudo :</label>
                <input type="text" className="form-control" onChange={(e) => {setLogin(e.currentTarget.value)}} id="exampleInputPassword1" value={login}/>
              </div>
              <a onClick={handleUpdateUser} className="btn btn-primary">Valider</a>
            </div>
          </div>
          </Modal.Body>
          </Modal>
      </div>
      <div className=''>
          <Modal show={showFa} className="card fade-scale">
          <Modal.Body className="card-body">
            <Modal.Title>Bonjour {data ? data['auth']['first_name'] : "utilisateur"}</Modal.Title>
          <div>
            <div >
              <div className="mb-3">
              <label className="form-label">Veuillez entrer le code que nous vous ont envoyer par mail :</label>
                <input type="text" className="form-control" onChange={(e) => {setFaCode(e.currentTarget.value)}} id="exampleInputPassword1" placeholder='XXXX'/>
              </div>
              <a onClick={handle2Fa} className="btn btn-primary">Valider</a>
            </div>
          </div>
          </Modal.Body>
          </Modal>
      </div>
    </>
  )
}

export default Auth