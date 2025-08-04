class CustomerManager {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Load customers button
    const loadCustomersBtn = document.getElementById("loadCustomers");
    if (loadCustomersBtn) {
      loadCustomersBtn.addEventListener("click", () => this.loadCustomers());
    }

    // Show registration form
    const showRegisterBtn = document.getElementById("showRegisterForm");
    if (showRegisterBtn) {
      showRegisterBtn.addEventListener("click", () =>
        this.toggleRegistrationForm(true),
      );
    }

    // Cancel registration
    const cancelRegisterBtn = document.getElementById("cancelRegister");
    if (cancelRegisterBtn) {
      cancelRegisterBtn.addEventListener("click", () =>
        this.toggleRegistrationForm(false),
      );
    }

    // Register form submission
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) =>
        this.handleRegistration(e),
      );
    }
  }

  toggleRegistrationForm(show) {
    const form = document.getElementById("customerRegistration");
    if (form) {
      form.style.display = show ? "block" : "none";
      if (!show) {
        this.clearRegistrationForm();
      }
    }
  }

  clearRegistrationForm() {
    const form = document.getElementById("registerForm");
    if (form) {
      form.reset();
    }
  }

  async loadCustomers() {
    const loadingMessage = document.getElementById("loadingMessage");
    const customersTable = document.getElementById("customersTable");

    this.showLoading(true);
    this.clearMessages();

    try {
      const response = await fetch("api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "ajax=1&action=getAllCustomers",
      });

      const result = await response.json();

      if (result.success) {
        this.displayCustomers(result.data || []);
        this.showMessage("Customers loaded successfully!", "success");
      } else {
        this.showMessage(
          "Error loading customers: " + (result.error || "Unknown error"),
          "error",
        );
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      this.showMessage("Network error: Could not load customers", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async handleRegistration(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const customerData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
    };

    // Validate required fields
    if (!customerData.name || !customerData.email) {
      this.showMessage("Please fill in all required fields", "error");
      return;
    }

    this.clearMessages();

    try {
      const response = await fetch("api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `ajax=1&action=registerCustomer&data=${encodeURIComponent(JSON.stringify(customerData))}`,
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage("Customer registered successfully!", "success");
        this.toggleRegistrationForm(false);
        // Optionally reload customers
        this.loadCustomers();
      } else {
        this.showMessage(
          "Error registering customer: " + (result.error || "Unknown error"),
          "error",
        );
      }
    } catch (error) {
      console.error("Error registering customer:", error);
      this.showMessage("Network error: Could not register customer", "error");
    }
  }

  displayCustomers(customers) {
    const container = document.getElementById("customersTable");

    if (!customers || customers.length === 0) {
      container.innerHTML = '<p class="no-data">No customers found.</p>';
      return;
    }

    let html = `
            <table class="customers-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Company</th>
                        <th>Date Added</th>
                    </tr>
                </thead>
                <tbody>
        `;

    customers.forEach((customer) => {
      html += `
                <tr>
                    <td>${this.escapeHtml(customer.name || "N/A")}</td>
                    <td>${this.escapeHtml(customer.email || "N/A")}</td>
                    <td>${this.escapeHtml(customer.phone || "N/A")}</td>
                    <td>${this.escapeHtml(customer.company || "N/A")}</td>
                    <td>${this.formatDate(customer.dateAdded || customer.timestamp)}</td>
                </tr>
            `;
    });

    html += `
                </tbody>
            </table>
        `;

    container.innerHTML = html;
  }

  showLoading(show) {
    const loadingMessage = document.getElementById("loadingMessage");
    if (loadingMessage) {
      loadingMessage.style.display = show ? "block" : "none";
    }
  }

  showMessage(message, type) {
    const container = document.getElementById("messageContainer");
    if (!container) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    container.appendChild(messageDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 5000);
  }

  clearMessages() {
    const container = document.getElementById("messageContainer");
    if (container) {
      container.innerHTML = "";
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateString) {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch (error) {
      return "Invalid Date";
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CustomerManager();
});
