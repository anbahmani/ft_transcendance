import { useRef, useState } from "react";
import Auth from "./Auth";
import { useUser } from "./lib/authHook";
import { useMutation, useQuery } from "@apollo/client";
import { FAValidate, activate2Fa, updateUserEm } from "./GraphQl/Queries";
import Logout from "./logout";
import Modal from 'react-bootstrap/Modal';

export default function profile() {
    const authenticated  = useUser();
    const user1 = JSON.parse(sessionStorage.getItem('user') as string);
    // const user1 = user;
    if (!authenticated)
        return (<Logout/>);
    const [imageUrl, setImageUrl] = useState("");
    const [image, setImage] = useState(null);
    const [ fa, setFa ] = useState("");
    const [ showFa, setShowFa ] = useState(false);
    const [login, setLogin] = useState(user1.login);
    const [email, setEmail] = useState(user1.email);
    const [uploadFile, {data, error}] = useMutation(updateUserEm, {onCompleted: data => {
        console.log("test",data.updateUser);
        sessionStorage.setItem("user", JSON.stringify(data.updateUser));
    }});
    const [validate2fa] = useMutation(FAValidate);
    const [activ2fa] = useMutation(activate2Fa);
    const successRef = useRef<HTMLInputElement | null>(null);
    const failRef = useRef<HTMLInputElement | null>(null);

    //changement image
    function handleChange(e: any) {
        if (e.target.files[0])
        {
            setImage(e.target.files[0]);
            setImageUrl(URL.createObjectURL(e.target.files[0]));
        }
    }

    const handleUpdateUser = async () =>
    {
        await uploadFile({variables:{login : login, file : image, email}, context: {
          headers: {
              "Apollo-Require-Preflight": "true"
          }
        }}).then((data) => {
            sessionStorage.setItem("user", JSON.stringify(data.data?.updateUser));
            successRef.current?.classList.remove("d-none"); // Show success alert
            failRef.current?.classList.add("d-none"); // Hide failure alert
            setTimeout(() => {
                successRef.current?.classList.add("d-none"); // Hide success alert after 5 seconds
            }, 5000);
        }).catch(() => {
            successRef.current?.classList.add("d-none"); // Hide success alert
            failRef.current?.classList.remove("d-none"); // Show failure alert
            setTimeout(() => {
                failRef.current?.classList.add("d-none"); // Hide failure alert after 5 seconds
            }, 5000);
        });
    }

    //validate 2fa code 
    const handle2Fa = async () => {
        if (user1)
        {
        await validate2fa({variables:{code : fa, email : user1['email']}, context: {
            headers: {
                "Apollo-Require-Preflight": "true"
            }
        }}).then((data) => {
            if (data)
            {
                if (data.data.F2aValidate.isVerified)
                    user1.isVerified = true;
                sessionStorage.setItem("user", JSON.stringify(user1));
                successRef.current?.classList.remove("d-none"); // Show success alert
                failRef.current?.classList.add("d-none"); // Hide failure alert
                setTimeout(() => {
                    successRef.current?.classList.add("d-none"); // Hide success alert after 5 seconds
                }, 5000);
            }
            else {
                console.log("validate2fa data null | undefined 55");
            }
            setShowFa(false);
            // console.log('allala', data);
        })
        .catch(() =>
        {
            successRef.current?.classList.add("d-none"); // Hide success alert
            failRef.current?.classList.remove("d-none"); // Show failure alert
            setTimeout(() => {
                failRef.current?.classList.add("d-none"); // Hide failure alert after 5 seconds
            }, 5000);
        });
        }
    }

    const switch2Fa = async () =>
    {
        console.log("teststts");
        await activ2fa({ context: {
            headers: {
                "Apollo-Require-Preflight": "true"
            }
        }}).then((data) => {
            if (!user1.isVerified)
                setShowFa(true);
            else
            {
                user1.isVerified = false;
                sessionStorage.setItem("user", JSON.stringify(user1));
                successRef.current?.classList.remove("d-none"); // Show success alert
                failRef.current?.classList.add("d-none"); // Hide failure alert
                setTimeout(() => {
                    successRef.current?.classList.add("d-none"); // Hide success alert after 5 seconds
                }, 5000);
            }
        }).catch(() =>
        {
            successRef.current?.classList.add("d-none"); // Hide success alert
            failRef.current?.classList.remove("d-none"); // Show failure alert
            setTimeout(() => {
                failRef.current?.classList.add("d-none"); // Hide failure alert after 5 seconds
            }, 5000);
        });

    }

    

    return (
    <div className="container rounded bg-white mb-5">
    <div className="row">
        <div className="col-md-3 col-sm-6 border-right mx-auto">
            <div className="d-flex flex-column align-items-center text-center p-3 py-5">
            <img className="card-img-top rounded-circle my-2" src={user1 ? (imageUrl ? imageUrl : user1.image) : "https://static.vecteezy.com/system/resources/previews/011/675/374/original/man-avatar-image-for-profile-png.png"} alt="..."/>
            <div className="d-flex justify-content-center">
                <div className="btn btn-primary btn-rounded">
                    <label className="form-label text-white m-1" htmlFor="formFileSm">Choose file</label>
                    <input type="file" className="form-control d-none" onChange={handleChange} id="formFileSm" />
                </div>
            </div>
                <span className="font-weight-bold">{user1 ?  user1.first_name : "DJ HMIDA"}</span>
                <span className="text-black-50">{user1 ?  user1.email : "DJ@HMIDA.fr"}</span>
                <span> </span></div>
        </div>
        <div className="col-md-5 mx-auto">
            <div className="p-3 py-5 mx-auto">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mx-auto">Profile Settings</h4>
                </div>
                <div className="row mt-2">
                    <div className="col-md-12"><label className="labels">Login</label><input type="text" className="form-control" placeholder="first name" onChange={(e) => {setLogin(e.currentTarget.value)}} value={login}/></div>
                    <div className="col-md-12"><label className="labels">Email</label><input type="text" className="form-control" onChange={(e) => {setEmail(e.currentTarget.value)}}  value={email} /></div>
                </div>
                <div className="row mt-2 mx-auto">
                    <div className="mt-5 text-center col-6"><button onClick={handleUpdateUser} className="btn btn-primary profile-button" type="button">Save Profile</button></div>
                    <div className="mt-5 text-center col-6"><button onClick={switch2Fa} className={!user1.isVerified ? "btn btn-info profile-button" :"btn btn-danger profile-button" } type="button">{!user1.isVerified ? "Activate 2FA" : "Desactivate 2FA"}</button></div>
                    <div className="alert alert-success col-10 mx-auto mt-3 d-none" role="alert" ref={successRef}>Success</div>
                    <div className="alert alert-danger col-10 mx-auto mt-3 d-none" role="alert" ref={failRef}>Update failed please try later</div>
                </div>
            </div>
        </div>
        <div className=''>
            <Modal show={showFa} className="card fade-scale">
            <Modal.Body className="card-body">
            <Modal.Title>Bonjour {user1 ? user1['first_name'] : "utilisateur"}</Modal.Title>
            <div>
            <div >
                <div className="mb-3">
                <label className="form-label">Veuillez entrer le code recu par mail :</label>
                <input type="text" className="form-control" onChange={(e) => {setFa(e.currentTarget.value)}} id="exampleInputPassword1" placeholder='XXXX'/>
                </div>
                <a onClick={handle2Fa} className="btn btn-primary">Valider</a>
            </div>
            </div>
            </Modal.Body>
            </Modal>
        </div>
    </div>
    </div>
);
}