import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, getDocs, setDoc, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"; 

//Signup
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  if (!signupForm) return;

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
  if (!loginForm) return;

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
  if (!userStatus || !logoutBtn) return;

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
  const taskList = document.getElementById("taskList");
  if (!taskList) return;
  
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
        //start
        const li = document.createElement("li");
        // set color of a div based on priority
        const priorityColor = document.createElement("div");
        priorityColor.style.width = "10px";
        priorityColor.style.height = "10px";
        // Set the background color based on priority
        switch (task.priority) {
          case "High":
            priorityColor.style.backgroundColor = "red";
            break;
          case "Medium":
            priorityColor.style.backgroundColor = "yellow";
            break;
          case "Low":
            priorityColor.style.backgroundColor = "green";
            break;
        }
        priorityColor.style.display = "inline-block";
        priorityColor.style.marginRight = "10px";
        li.appendChild(priorityColor);
        //checkbox
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
        if(!auth.currentUser || auth.currentUser.uid !== task.userId) {
          return; // Skip tasks that don't belong to the current user
        }
        const taskDetails = document.createElement("span");
        taskDetails.textContent = ` Task: ${task.title} / Created At: ${(task.createdAt.toDate()).toString().substring(3,21)} / Due Date: ${task.dueDate}`;
        li.appendChild(taskDetails);
        //Edit title
        const editTitleButton = document.createElement("button");
        editTitleButton.textContent = "Edit Title";
        editTitleButton.onclick = function () {
          const inputContainer = document.createElement("div");
          const inputTitle = document.createElement("input");
          inputTitle.type = "text";
          inputTitle.value = task.title;
          inputTitle.style.marginRight = "10px";
          inputContainer.appendChild(inputTitle);
          const saveButton = document.createElement("button");
          saveButton.textContent = "Save";
          inputContainer.appendChild(saveButton);
          li.appendChild(inputContainer);
          saveButton.onclick = function () {
            const newTitle = inputTitle.value;
            if (newTitle) {
              updateDoc(doc(db, "tasks", task.id), {
                title: newTitle,
              })
                .then(() => {
                  alert("Title updated successfully!");
                  window.location.href = "index.html";
                })
                .catch((error) => {
                  alert("Error updating: " + error.message);
                  console.error("Update error:", error);
                });
              } else {
                alert("Please enter a valid title.");
              }
          };
        }
        li.appendChild(editTitleButton);
        //Edit due date
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
        }
        li.appendChild(editButton);
        //Delete 
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
        //End
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
if (addTask) {
  addTask.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("title").value;
  const due = document.getElementById("due").value;
  const priority = document.getElementById("priority").value;
  const user = auth.currentUser;
    try {
      await addDoc(collection(db, "tasks"), {
        userId: user.uid,
        title: title,
        completed: false,
        dueDate: due,
        priority: priority,
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
}

//Dark Theme
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            alert('Dark theme toggled!');
            const link = document.getElementById('themeStylesheet');

            if (link && link.getAttribute('href').includes('styles/login.css')) {
                link.setAttribute('href', 'styles/loginDark.css');
            } else if (link && link.getAttribute('href').includes('styles/loginDark.css')) {
                link.setAttribute('href', 'styles/login.css');
            }
        });
    }
});