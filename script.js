import { db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"; 

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
        const li = document.createElement("li");
        const button = document.createElement("button");
        li.textContent = `Task: ${task.title} / Completed: ${task.completed} / Created At: ${(task.createdAt.toDate()).toString().substring(3,21)}`;
        button.innerHTML = "<button>Delete</button>";
        li += button;
        list.appendChild(li); 
    });
  } catch (error) { 
    console.error("Error reading data from Firestore:", error); 
    alert("Failed to load tasks. Please try again later."); 
  }
});

//Delete task
// How do i add an error case to this 
const deleteButton = document.getElementById("deleteTask");
deleteButton.addEventListener("click", async () => {
  const taskId = prompt("Enter the ID of the task to delete:");
  if (taskId) {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      alert("Task deleted successfully!");
      window.location.href = "index.html";
    } catch (error) {
      alert("Error deleting: " + error.message);
      console.error("Delete error:", error);
    }
  } else {
    alert("Task ID is required to delete a task.");
  }
});


//Add a new task
const addTask = document.getElementById("addTask");

addTask.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("title").value;
    try {
      await addDoc(collection(db, "tasks"), {
        //userId: user.uid,
        title: title,
        completed: false,
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

//Mark Task as complete
