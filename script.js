import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, getDocs, setDoc, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"; 

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

//Check if logged in
document.addEventListener("DOMContentLoaded", () => {
  const userStatus = document.getElementById("userStatus");
  const logoutBtn = document.getElementById("logoutBtn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userStatus.textContent = "Logged in as: " + user.email;
    } else {
      userStatus.textContent = "Not logged in. Redirecting...";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      window.location.href = "login.html";
    } catch (error) {
      alert("Error logging out: " + error.message);
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

    function renderTasks(filter) {
      list.innerHTML = ""; // Clear the list
      tasks.forEach((task) => {
        if (filter === "completed" && !task.completed) {
          return; // Skip non-completed tasks
        }
        if (filter === "pending" && task.completed) {
          return; // Skip completed tasks
        }

        const li = document.createElement("li");
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
            window.location.href = "index.html";
          } catch (error) {
            alert("Error updating: " + error.message);
            console.error("Update error:", error);
          }
        });

        li.appendChild(checkbox);
        if(auth.currentUser.uid !== task.userId) {
          return; // Skip tasks that don't belong to the current user
        }
        const taskDetails = document.createElement("span");
        taskDetails.textContent = ` Task: ${task.title} / Created At: ${(task.createdAt.toDate()).toString().substring(3,21)} / Due Date: ${task.dueDate}`;
        li.appendChild(taskDetails);

        const editButton = document.createElement("button");
        editButton.textContent = "Edit Due Date";
        editButton.onclick = function () {
          const inputContainer = document.createElement("div");
          const inputDate = document.createElement("input");
          inputDate.type = "date";
          inputDate.style.marginRight = "10px";
          inputContainer.appendChild(inputDate);
          const saveButton = document.createElement("button");
          saveButton.textContent = "Save";
          inputContainer.appendChild(saveButton);
          li.appendChild(inputContainer);
          saveButton.onclick = function () {
            const newDate = inputDate.value;
            if (newDate) {
              updateDoc(doc(db, "tasks", task.id), {
                dueDate: newDate,
              })
                .then(() => {
                  alert("Due date updated successfully!");
                  window.location.href = "index.html";
                })
                .catch((error) => {
                  alert("Error updating: " + error.message);
                  console.error("Update error:", error);
                });
            } else {
              alert("Please select a valid date.");
            }
          };
        };

        li.appendChild(editButton);
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
    }

    const allButton = document.getElementById("all");
    const completedButton = document.getElementById("completed");
    const pendingButton = document.getElementById("pending");

    allButton.addEventListener("click", () => {
      console.log("All button clicked");
      renderTasks("all");
    });
    completedButton.addEventListener("click", () => {
      console.log("Completed button clicked");
      renderTasks("completed");
    });
    pendingButton.addEventListener("click", () => {
      console.log("Pending button clicked");
      renderTasks("pending");
    });

    renderTasks("all");
  } catch (error) { 
    console.error("Error reading data from Firestore:", error); 
  }
});



//Add a new task
const addTask = document.getElementById("addTask");

addTask.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("title").value;
  const due = document.getElementById("due").value;
  const user = auth.currentUser;
    try {
      await addDoc(collection(db, "tasks"), {
        userId: user.uid,
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
