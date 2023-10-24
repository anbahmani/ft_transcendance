import { redirect } from 'react-router-dom';
import Auth from './Auth';

export default function Logout(): React.ReactElement
{
    sessionStorage.removeItem('user');
    return (<Auth/>);
}