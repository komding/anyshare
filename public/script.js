function showHome() {
  hideAllForms();
  document.getElementById('homeDescription').classList.remove('d-none');
}

function showAboutMe() {
  hideAllForms();
  document.getElementById('aboutMeDescription').classList.remove('d-none');
}

function showPublishForm() {
  hideAllForms();
  document.getElementById('publishTextForm').classList.remove('d-none');
}

function showAccessForm() {
  hideAllForms();
  document.getElementById('accessTextForm').classList.remove('d-none');
}

document.getElementById('publishForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const text = document.getElementById('text').value;
  const identifier = document.getElementById('identifier').value;

  fetch('/publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `text=${encodeURIComponent(text)}&identifier=${encodeURIComponent(identifier)}`,
  })
    .then(response => response.text())
    .then(data => {
      document.getElementById('publishLink').innerText = data;
    });
});

document.getElementById('accessForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const accessIdentifier = document.getElementById('accessIdentifier').value;

  fetch(`/access/${encodeURIComponent(accessIdentifier)}`)
    .then(response => response.text())
    .then(data => {
      document.getElementById('accessText').innerText = data;
    })
    .catch(error => {
      document.getElementById('accessText').innerText = 'Text not found.';
    });
});

function copyToClipboardPublish(elementId) {
  const element = document.getElementById(elementId);
  const text = element.innerText.split(': ')[1]; // Extract the link from the displayed text

  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard');
  });
}

function copyToClipboardAccess(elementId) {
  const element = document.getElementById(elementId);
  const text = element.innerText;

  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard');
  });
}

function hideAllForms() {
  document.getElementById('publishTextForm').classList.add('d-none');
  document.getElementById('accessTextForm').classList.add('d-none');
  document.getElementById('homeDescription').classList.add('d-none');
  document.getElementById('aboutMeDescription').classList.add('d-none');
}
