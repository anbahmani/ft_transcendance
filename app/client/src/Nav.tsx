import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Logo from './assets/logo.webp';
import Logout from './assets/logout.png'
import { useUser } from './lib/authHook';
import './Nav.css'

function NavBar() {
  const user = useUser();

  if (!user) {
    return <></>;
  }
  return (
    <div className='Nav container p-0'>
      <Navbar bg="dark" data-bs-theme="dark" expand='sm'>
        <Container>
          <Navbar.Brand href="#home">
            <img
              alt=""
              src={Logo}
              width="100"
              height="auto"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
		<Navbar.Toggle aria-controls='my-nav'/>
		<Navbar.Collapse id='my-nav'>
          <Nav className='me-auto'>
            <Nav.Link className='link-text' href="/App">Home</Nav.Link>
            <Nav.Link className='link-text' href="/Chat">Chat</Nav.Link>
            <Nav.Link className='link-text' href="/friends">Friends</Nav.Link>
            <Nav.Link className='link-text' href="/game">Pong</Nav.Link>
            <Nav.Link className='link-text' href="/profile">Profile</Nav.Link>
            <Nav.Link className='link-text' href="/Spectate">Spectate</Nav.Link>
            <Nav.Link onClick={() => {sessionStorage.clear(); window.location.replace("/");}}>
              <img	src={Logout} width="20"/>
            </Nav.Link>
          </Nav>
		</Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default NavBar;
