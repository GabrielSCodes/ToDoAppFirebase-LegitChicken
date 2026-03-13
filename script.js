import { db } from "./firebase-config.js"; 
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"; 

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
        li.textContent = `${task.order} Task ${task.toDo} Status: ${task.status}`; 
        list.appendChild(li); 
    });
  } catch (error) { 
    console.error("Error reading data from Firestore:", error); 
    alert("Failed to load tasks. Please try again later."); 
  }

});