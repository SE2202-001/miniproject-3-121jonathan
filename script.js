// Job class to encapsulate job data and related methods
class Job {
    constructor({ Title, Posted, Type, Level, Skill, Detail }) {
      this.title = Title;
      this.posted = Posted;
      this.type = Type;
      this.level = Level;
      this.skill = Skill;
      this.detail = Detail;
    }
  
    // Normalize posted time for sorting
    getPostedTimeInMinutes() {
      const timeUnits = { minute: 1, hour: 60, day: 1440 };
      const [value, unit] = this.posted.split(" ");
      return parseInt(value) * (timeUnits[unit] || 1);
    }
  
    // Return formatted job details
    getDetails() {
      return `
        Title: ${this.title}
        Posted: ${this.posted}
        Type: ${this.type}
        Level: ${this.level}
        Skill: ${this.skill}
        Details: ${this.detail || "N/A"}
      `;
    }
  }
  
  // Global variables
  const fileInput = document.getElementById('fileInput');
  const jobContainer = document.getElementById('jobContainer');
  const levelFilter = document.getElementById('levelFilter');
  const typeFilter = document.getElementById('typeFilter');
  const skillFilter = document.getElementById('skillFilter');
  const sortOptions = document.getElementById('sortOptions');
  
  let jobs = []; // Array to hold Job objects
  let filteredJobs = []; // Array to hold filtered Job objects
  
  // File upload handler
  fileInput.addEventListener('change', handleFileUpload);
  
  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
      alert('Please select a file!');
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result); // Parse JSON data
        jobs = jsonData.map((jobData) => new Job(jobData)); // Convert to Job objects
        filteredJobs = jobs;
        populateFilters();
        displayJobs(jobs);
      } catch (error) {
        alert('Invalid JSON file format. Please upload a valid file.');
      }
    };
  
    reader.readAsText(file);
  }
  
  // Display jobs in the container
  function displayJobs(jobs) {
    jobContainer.innerHTML = ''; // Clear previous listings
    jobs.forEach((job) => {
      const jobCard = document.createElement('div');
      jobCard.className = 'job';
      jobCard.innerHTML = `
        <h3>${job.title}</h3>
        <p><strong>Posted:</strong> ${job.posted}</p>
        <p><strong>Type:</strong> ${job.type}</p>
        <p><strong>Level:</strong> ${job.level}</p>
        <p><strong>Skill:</strong> ${job.skill}</p>
      `;
      jobCard.addEventListener('click', () => alert(job.getDetails())); // Show job details
      jobContainer.appendChild(jobCard);
    });
  }
  
  // Populate filter dropdowns
  function populateFilters() {
    const levels = [...new Set(jobs.map((job) => job.level))];
    const types = [...new Set(jobs.map((job) => job.type))];
    const skills = [...new Set(jobs.map((job) => job.skill))];
  
    populateDropdown(levelFilter, levels);
    populateDropdown(typeFilter, types);
    populateDropdown(skillFilter, skills);
  }
  
  function populateDropdown(dropdown, options) {
    dropdown.innerHTML = '<option value="">All</option>';
    options.forEach((option) => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      dropdown.appendChild(opt);
    });
  }
  
  // Filter jobs based on selected criteria
  function applyFilters() {
    const level = levelFilter.value;
    const type = typeFilter.value;
    const skill = skillFilter.value;
  
    filteredJobs = jobs.filter(
      (job) =>
        (!level || job.level === level) &&
        (!type || job.type === type) &&
        (!skill || job.skill === skill)
    );
    displayJobs(filteredJobs);
  }
  
  // Sort jobs based on selected criteria
  function applySort() {
    const sortBy = sortOptions.value;
  
    if (sortBy === 'title') {
      filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'time') {
      filteredJobs.sort((a, b) => a.getPostedTimeInMinutes() - b.getPostedTimeInMinutes());
    }
  
    displayJobs(filteredJobs);
  }
  
  // Event listeners for filters and sorting
  document.querySelectorAll('#filters select').forEach((filter) => {
    filter.addEventListener('change', applyFilters);
  });
  sortOptions.addEventListener('change', applySort);
  