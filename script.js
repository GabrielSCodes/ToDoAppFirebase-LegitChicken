import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, getDocs, setDoc, deleteDoc, doc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"; 

//Signup
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("usernm").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        createdAt: serverTimestamp()
      });

      alert("User signed up successfully!");
      window.location.href = "login.html";
    } catch (error) {
      alert("Error signing up: " + error.message);
      console.error("Signup error:", error);
    }
  });
});

//Login
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in successfully!");
      window.location.href = "index.html";
    } catch (error) {
      alert("Error logging in: " + error.message);
      console.error("Login error:", error);
    }
  });
});

//Display tasks
document.addEventListener("DOMContentLoaded", async () => { 
  const taskCollection = collection(db, "tasks");

  try { 
    const querySnapshot = await getDocs(taskCollection); 
    console.log("Query Snapshot:", querySnapshot); 

    const tasks = []; 
    querySnapshot.forEach((doc) => { 
      tasks.push({ 
        id: doc.id, 
        ...doc.data(), 
      });
    });
    console.log("Tasks Array:", tasks); 

    const list = document.getElementById("taskList"); 
    
    tasks.forEach((task) => { 
        //List element
        const li = document.createElement("li");
        //Task completion checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        if (task.completed) {
          checkbox.checked = true;
        }
        checkbox.addEventListener("change", async () => {
          try {
            await setDoc(doc(db, "tasks", task.id), {
              ...task,
              completed: checkbox.checked
            });
            alert("Task completed status updated successfully!");
          } catch (error) {
            alert("Error updating: " + error.message);
            console.error("Update error:", error);
          }
        });

        li.appendChild(checkbox);
        //Task details
        const taskDetails = document.createElement("span");
        taskDetails.textContent = ` Task: ${task.title} / Created At: ${(task.createdAt.toDate()).toString().substring(3,21)} / Due Date: ${task.dueDate}`;
        li.appendChild(taskDetails);
        //Delete task button
        const newButton = document.createElement("button");
        newButton.textContent = "Delete Task";
        newButton.onclick = function() {
          deleteDoc(doc(db, "tasks", task.id))
            .then(() => {
              alert("Task deleted successfully!");
              window.location.href = "index.html";
            })
            .catch((error) => {
              alert("Error deleting: " + error.message);
              console.error("Delete error:", error);
            });
        };
        li.appendChild(newButton);
        list.appendChild(li); 
    });
  } catch (error) { 
    console.error("Error reading data from Firestore:", error); 
    alert("Failed to load tasks. Please try again later."); 
  }
});

//Add a new task
const addTask = document.getElementById("addTask");

addTask.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("title").value;
  const due = document.getElementById("due").value;
    try {
      await addDoc(collection(db, "tasks"), {
        //userId: user.uid,
        title: title,
        completed: false,
        dueDate: due,
        createdAt: serverTimestamp()
      });
      alert("Task added successfully!");
      addTask.reset();
      window.location.href = "index.html";
    } catch (error) {
      alert("Error adding: " + error.message);
      console.error("Task error:", error);
    }
});
