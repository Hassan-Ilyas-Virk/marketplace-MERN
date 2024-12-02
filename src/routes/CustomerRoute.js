import { Navigate } from 'react-router-dom';

const CustomerRoute = ({ children }) => {
   const user = JSON.parse(localStorage.getItem('user'));
   
   if (!user) {
       return <Navigate to="/login" replace />;
   }

   // Redirect sellers to their homepage
   if (user.role === 'Seller') {
       return <Navigate to="/seller" replace />;
   }

   return children;
};

export default CustomerRoute;