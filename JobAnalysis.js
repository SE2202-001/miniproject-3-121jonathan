// JobAnalysis.js

// Job Class Definition
class Job {
  // Constructs a new Job instance.
  constructor({ Title, Posted, Type, Level, Skill, Detail }) {
    this.title = Title;
    this.posted = Posted;
    this.type = Type;
    this.level = Level;
    this.skill = Skill;
    this.detail = Detail;
  }

  // Converts the posted time into minutes for sorting purposes.
  getPostedTimeInMinutes() {
    return parsePostedTime(this.posted);
  }

  // Returns a formatted string containing job details.
  getDetails() {
    return `
      <h2>${escapeHTML(this.title)}</h2>
      <p><strong>Posted:</strong> ${escapeHTML(this.posted)}</p>
      <p><strong>Type:</strong> ${escapeHTML(this.type)}</p>
      <p><strong>Level:</strong> ${escapeHTML(this.level)}</p>
      <p><strong>Skill:</strong> ${escapeHTML(this.skill)}</p>
      <p><strong>Details:</strong> ${escapeHTML(this.detail || "N/A")}</p>
    `;
  }
}

// DOM Elements Selection
const fileInput = document.getElementById('fileInput');
const jobContainer = document.getElementById('jobContainer');
const levelFilter = document.getElementById('levelFilter');
const typeFilter = document.getElementById('typeFilter');
const skillFilter = document.getElementById('skillFilter');
const sortOptions = document.getElementById('sortOptions');

// Data Arrays to Store Jobs
let jobs = [];          // All jobs loaded from the JSON file
let filteredJobs = [];  // Jobs after applying filters

// Event Listeners
fileInput.addEventListener('change', handleFileUpload);
levelFilter.addEventListener('change', applyFilters);
typeFilter.addEventListener('change', applyFilters);
skillFilter.addEventListener('change', applyFilters);
sortOptions.addEventListener('change', applySort);

// Initialize Modal (Create once)
const modal = createModal();
document.body.appendChild(modal.overlay);

// Handles the file upload event.
// Parses the uploaded JSON file and initializes job data.
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    alert('Please select a JSON file to upload!');
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const jsonData = JSON.parse(e.target.result);

      // Validate that jsonData is an array
      if (!Array.isArray(jsonData)) {
        throw new Error('JSON data is not an array.');
      }

      // Create Job instances
      jobs = jsonData.map((jobData) => new Job(jobData));
      filteredJobs = [...jobs]; // Initialize filteredJobs with all jobs

      // Populate filter dropdowns
      populateFilters();

      // Set default sort option to 'time' for most recent first
      sortOptions.value = 'time';
      applySort(); // Apply initial sort
    } catch (error) {
      alert('Invalid JSON file format. Please upload a valid file.');
      console.error('JSON Parsing Error:', error);
    }
  };

  reader.readAsText(file);
}

// Displays the list of jobs in the job container.
function displayJobs(jobsToDisplay) {
  jobContainer.innerHTML = ''; // Clear existing jobs

  if (jobsToDisplay.length === 0) {
    jobContainer.innerHTML = '<p>No jobs match the selected criteria.</p>';
    return;
  }

  jobsToDisplay.forEach((job) => {
    const jobCard = document.createElement('div');
    jobCard.className = 'job';
    jobCard.innerHTML = `
      <h3>${escapeHTML(job.title)}</h3>
      <p><strong>Posted:</strong> ${escapeHTML(job.posted)}</p>
      <p><strong>Type:</strong> ${escapeHTML(job.type)}</p>
      <p><strong>Level:</strong> ${escapeHTML(job.level)}</p>
      <p><strong>Skill:</strong> ${escapeHTML(job.skill)}</p>
    `;

    // Event listener to show job details in modal on click
    jobCard.addEventListener('click', () => showJobDetails(job));

    jobContainer.appendChild(jobCard);
  });
}

// Populates the filter dropdowns with unique values from the jobs data.
function populateFilters() {
  const levels = getUniqueSortedValues(jobs, 'level');
  const types = getUniqueSortedValues(jobs, 'type');
  const skills = getUniqueSortedValues(jobs, 'skill');

  populateDropdown(levelFilter, levels);
  populateDropdown(typeFilter, types);
  populateDropdown(skillFilter, skills);
}

// Populates a dropdown element with given options.
function populateDropdown(dropdown, options) {
  // Clear existing options except the first one ('All')
  dropdown.innerHTML = '<option value="">All</option>';

  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    dropdown.appendChild(opt);
  });
}

// Parses the "Posted" time string into minutes.
// Handles both singular and plural units (e.g., "1 hour", "2 days").
function parsePostedTime(posted) {
  if (!posted) return Infinity; // Treat missing times as least recent

  const timeUnits = { minute: 1, hour: 60, day: 1440 };
  let [value, unit] = posted.toLowerCase().split(" ");

  if (!value || !unit || isNaN(parseInt(value, 10))) {
    return Infinity; // Treat malformed times as least recent
  }

  // Remove trailing 's' if present to handle plural units (e.g., 'hours' -> 'hour')
  unit = unit.replace(/s$/, '');

  return parseInt(value, 10) * (timeUnits[unit] || Infinity);
}

// Sorts and displays the filtered jobs based on the selected sort option.
function applySort() {
  const sortBy = sortOptions.value;

  if (sortBy === 'title') {
    // Sort alphabetically by title (A-Z)
    filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'time') {
    // Sort by posted time from most recent to least recent
    filteredJobs.sort((a, b) => a.getPostedTimeInMinutes() - b.getPostedTimeInMinutes());
  }

  displayJobs(filteredJobs);
}

// Filters the jobs based on selected criteria and applies sorting.
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

  applySort(); // Apply sorting after filtering
}

// Retrieves unique and sorted values for a given property from the jobs array.
function getUniqueSortedValues(jobsArray, property) {
  return [...new Set(jobsArray.map((job) => job[property]))].sort();
}

// Displays the details of a job in a custom modal.
function showJobDetails(job) {
  // Set the modal content
  modal.content.innerHTML = job.getDetails();

  // Show the modal
  modal.overlay.style.display = 'flex';
}

// Creates a custom modal and appends it to the document body.
function createModal() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'modalOverlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
  });

  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'modalContainer';
  Object.assign(modalContainer.style, {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '80%',
    maxWidth: '600px',
    padding: '20px',
    position: 'relative',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    maxHeight: '80vh',
    overflowY: 'auto',
  });

  // Create close button
  const closeButton = document.createElement('span');
  closeButton.innerHTML = '&times;';
  Object.assign(closeButton.style, {
    position: 'absolute',
    top: '10px',
    right: '20px',
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#aaa',
    cursor: 'pointer',
  });

  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.color = '#000';
  });

  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.color = '#aaa';
  });

  // Close modal on click
  closeButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  // Close modal when clicking outside the modal container
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.style.display = 'none';
    }
  });

  // Append close button and modal container to overlay
  modalContainer.appendChild(closeButton);
  overlay.appendChild(modalContainer);

  // Create content area inside modal container
  const content = document.createElement('div');
  content.id = 'modalContent';
  modalContainer.appendChild(content);

  return { overlay, content };
}

// Escapes HTML special characters to prevent XSS attacks.
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (match) => {
    const escapeChars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return escapeChars[match];
  });
}
