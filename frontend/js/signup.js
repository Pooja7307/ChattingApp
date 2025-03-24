document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    try {
      const res = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("Signup successful! Please login.");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Signup failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error signing up");
    }
  });
  