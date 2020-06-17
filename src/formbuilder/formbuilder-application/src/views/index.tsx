import React from 'react';
import { ActionButton } from '@helsenorge/toolkit/components/atoms/buttons/action-button';
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";


function Index() {
    let history = useHistory();
 
    function handleClick() {
      history.push('/create-form');
    }
  return (
      <div style={{height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
          <h1>Velkommen til skjemadesigneren</h1>
          <div style={{display:"inline-block"}}>
              <Link to="create-form">
                <ActionButton 
                    onClick={() => {
                       /*handleClick()*/
                    }} 
                >
                    {'Lag nytt spørreskjema'}
                </ActionButton>
                </Link>
            </div>
    </div>
  );
}

export default Index;
