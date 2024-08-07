// Call the function when the document is ready
document.addEventListener('DOMContentLoaded', handleSplashScreen);

function handleSplashScreen() {
    // Select the splash image element
    const splashContainer = document.querySelector('.splash-container');
    const splashImage = document.querySelector('.splash-image');

    // Check if elements exist
    if (!splashContainer || !splashImage) {
        console.error('Splash screen elements not found.');
        return;
    }

    // Add a class to start the fade-out animation
    splashImage.classList.add('fade-out');

    // Wait for the animation to complete before redirecting after 4.5 seconds
    setTimeout(function() {
        // Redirect to the main screen
        window.location.href = '/speciesPrediction';
        splashContainer.classList.add('hidden');
    }, 4500); // 4.5 seconds in milliseconds (adjust as needed)
}


function chooseImageFromGallery() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();

    fileInput.addEventListener('change', function() {
        const uploadedImage = document.getElementById('uploadedImage');
        const imageContainer = document.getElementById('imageContainer');

        const file = fileInput.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            uploadedImage.src = imageUrl;
            showImageContainer();
        }
    });
}

function showImageContainer() {
    const imageContainer = document.getElementById('imageContainer');
    const searchButton = document.getElementById('searchButton');

    imageContainer.style.display = 'block';
    searchButton.style.display = 'block';
}

function searchImage() {
    const imageForm = document.getElementById('imageForm');
    const formData = new FormData(imageForm);

    fetch('/identify_species', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            // Update the result div with species information
            const resultDiv = document.querySelector('.right-side');
            resultDiv.innerHTML = `
            <div class="panel">
                <a onclick = resetDiv()><i class='bx bx-reset'></i>Reset</a>
                <a onclick = downloadDiv()><i class='bx bx-download'></i>Download</a>
            </div>
            <div class="download-container">
                <div class="predict-container">
                    <div class="info">
                        <p><span>Category: </span>${data.category}</>
                        <p><span>Common Name: </span>${data.common_name}</p>
                        <p><span>Family Name: </span>${data.family_name}</p>
                        <p><span>Scientific Name: </span>${data.scientific_name}</p>
                        <p><span>Height: </span>${data.height}</p>
                        <p><span>Weight: </span>${data.weight}</p>
                        <p><span>Habitat: </span>${data.habitat}</p>
                        <p><span>Lifespan: </span>${data.lifespan}</p> 
                    </div>
                    <div class="image">
                        <img src="${data.image}" alt="Identified Species Image">
                    </div>   
                </div>
                <p class="description"><span>Description: </span>${data.description}</p>
            </div>
        `;
        })
        .catch(error => {
            console.error('Error identifying species:', error);
        });
}

function resetDiv() {
    const rightside = document.querySelector('.right-side');
    rightside.innerHTML = '';
    document.getElementById('imageContainer').style.display = 'none';
    document.getElementById('searchButton').style.display = 'none';

}

function downloadDiv() {
    var HTML_Width = $(".download-container").width();
    var HTML_Height = $(".download-container").height();
    var top_left_margin = 30;
    var PDF_Width = HTML_Width + (top_left_margin * 2);
    var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
    var canvas_image_width = HTML_Width;
    var canvas_image_height = HTML_Height;

    var totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;

    html2canvas($(".download-container")[0]).then(function(canvas) {
        var imgData = canvas.toDataURL("image/jpeg", 1.0);
        var pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
        pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);
        for (var i = 1; i <= totalPDFPages; i++) {
            pdf.addPage(PDF_Width, PDF_Height);
            pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height);
        }
        pdf.save("Your_PDF_Name.pdf");
    });
}

function submitToGoogleSheet() {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxFofWqkS7qnTcGRvYk-Myh-T4DgwfNT4VCoP7SJyFuOsM11TvZgnAvU2ygmre4TvM_/exec';
    const form = document.forms['submit-to-google-sheet'];
    const message = document.getElementById("message");

    let formSubmitted = false;

    form.addEventListener('submit', e => {
        e.preventDefault();

        if (!formSubmitted) {
            fetch(scriptURL, {
                    method: 'POST',
                    body: new FormData(form)
                })
                .then(response => {
                    message.innerHTML = "Message Sent Successfully!";
                    setTimeout(function() {
                        message.innerHTML = "";
                    }, 5000);
                    form.reset();
                    formSubmitted = true; // Set the flag to true after successful submission

                })
                .catch(error => console.error('Error!', error.message));
        } else {
            console.log("Form already submitted.");
        }
    });
}