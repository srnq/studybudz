import React, { useEffect, useState } from 'react';
import { db, auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, collection, getDocs, set } from "firebase/firestore";
import '../Styles.css';

function Profile({ isAuth }) {
  
  let nagivate = useNavigate();
  const userColRef = collection(db, "users");
  const [hasProfile, setHasProfile] = useState(true);

  // If user not authenticated, redirect to login page
  useEffect(() => {
    if (!isAuth) {
      nagivate("/");
    }
  }, []);

  // Retrieve profile info when page loads
  useEffect(() => {
    getDocs(userColRef)
    .then((snapshot) => {
      let hasProfileTemp = false; 
      snapshot.docs.forEach((doc) => {
        if (doc.id == auth.currentUser.uid) {
          document.getElementById("classesInput").value = doc.data().classes.join(", ");
          document.getElementById("bioInput").value = doc.data().bio;
          hasProfileTemp = true;
        }
      });
      if (!hasProfileTemp) { setHasProfile(false); }
    })
    .catch(err => {
      console.log(err);
    });
  }, []);

  // Update profile
  const updateProfile = async () => {
    // Add/update to Cloud Firestore
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      classes: document.getElementById("classesInput").value.split(",").map(x => x.trim()),
      bio: document.getElementById("bioInput").value,
      name: auth.currentUser.displayName
    });

    // Retrieve profile info when updated
    getDocs(userColRef)
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        if (doc.id == auth.currentUser.uid) {
          document.getElementById("classesInput").value = doc.data().classes.join(", ");
          document.getElementById("bioInput").value = doc.data().bio;
        }
      });
    })
    .catch(err => {
      console.log(err);
    }); 

    // Displays "Saved!" after saving
    const showSaveMessage = () => {
      document.getElementById("saveMessage").style.display = "block";
    }
    showSaveMessage();
  };

  // UI
  return (
    <div className="page">      
      <h1 className='title'>My Profile</h1>
      <div>
        <b className='inputHeader'>My Classes</b>
        <div className='note'>Note: Separate classes using commas.</div>
        {hasProfile ? (
          <input className="inputSmall" id="classesInput"></input>
        ) : (
          <div id="classesInput" onClick={() => setHasProfile(true)}><i>Add your classes here!</i></div>
        )}
      </div>
      <br/>
      <div>
        <b className='inputHeader'>About Me</b>
        <br/>
        {hasProfile ? (
          <textarea className="inputLarge" id="bioInput"></textarea>
        ) : (
          <div id="bioInput" onClick={() => setHasProfile(true)}><i>Add your bio here!</i></div>
        )}
      </div>
      <br/>
      <button className="button1" id='savebutton' onClick={updateProfile}>Save Profile</button> 
      <div id="saveMessage">Saved!</div>
    </div>
  )
}

export default Profile;