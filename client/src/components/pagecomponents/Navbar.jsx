import React from 'react'
import {Link} from "react-router-dom"
function Navbar() {
  return (
      <div className="bg-red-900 p-4 flex items-center justify-center gap-4">
          <div className="bg-red-700 p-2 flex gap-4 w-full justify-center">
              <Link to="/">
                  <h4>Home</h4>
              </Link>
              <Link to="/ride">
                  <h4>Ride</h4>
              </Link>
              <Link to="/register">
                  <h4>Register</h4>
              </Link>
              <Link to="/login">
                  <h4>Login</h4>
              </Link>
          </div>
      </div>
  );
}

export default Navbar