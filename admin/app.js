
var th = (function(window) {
  var categoryULs,
    fileInput,
    photoInputList,
    captions,
    quotes,
    quoteList,
    quoteInputList,
    quoteForm,
    photoForm,
    bucketContents,
    submitFormButtons,
    submitQuotesButton,
    successModal;

  var secret = '',
    accessKey = '',
    bucketName = '',
    creds = new AWS.Credentials(accessKey, secret);

  AWS.config.update({
    region: '',
    credentials: creds
  });

  var s3Bucket = new AWS.S3({
    params: {Bucket: bucketName}
  });

  function photoFormSubmit(e) {
    e.preventDefault();
    if (!fileInput.files.length) {
      return alert('Please choose a file to upload first.');
    }
    photoFormButtons.style.pointerEvents = "none";
    photoFormButtons.firstElementChild.innerHTML = '<img src="https://media.giphy.com/media/wgXkLPkEmPKsU/giphy.gif" alt="" height="16" width="16" />';

    const formData = new FormData(photoForm);

    let promises = Array.from(fileInput.files).map(file => {
      captions[file.name] = formData.get(`caption-${file.name}`);
      let category = formData.get(`category-${file.name}`);
      let fullname = `assets/${category.toLowerCase()}/${file.name}`;

      return s3Bucket.upload({
        Key: fullname,
        Body: file,
        ACL: 'public-read'
      }).promise()
    });

    promises.push(uploadCaptions());

    Promise.all(promises)
      .then(() => {
        success();
        th.resetUploadForm();
      })
      .catch((err) => alert(err))
      .then(() => {
        photoFormButtons.firstElementChild.innerHTML = 'Upload photo(s)';
        photoFormButtons.style.pointerEvents = 'auto';
      });
  }

  function quoteFormSubmit(e) {
    e.preventDefault();
    submitQuotesButton.style.pointerEvents = "none";
    submitQuotesButton.innerHTML = '<img src="https://media.giphy.com/media/wgXkLPkEmPKsU/giphy.gif" alt="" height="16" width="16" />';

    const oldQuotes = quotes.slice();
    for (let liEl of quoteInputList.children) {
      var firstChild = liEl.firstElementChild;
      quotes.push([firstChild.value, firstChild.nextElementSibling.value])
    }
    uploadQuotes()
      .then(() => {
        success();
        quoteForm.reset();
        quoteInputList.innerHTML = '';
        submitQuotesButton.style.display = "none";
        displayQuoteList();
      })
      .catch((err) => {
        quotes = oldQuotes;
        alert(err);
      })
      .then(() => {
        submitQuotesButton.innerHTML = "Upload quote(s)";
        submitQuotesButton.style.pointerEvents = "auto";
      });
  }

  function uploadCaptions() {
    return s3Bucket.putObject({
      Key: 'assets/captions.json',
      Body: JSON.stringify(captions),
      ACL: "public-read"
    }).promise();
  }

  function uploadQuotes() {
    return s3Bucket.putObject({
      Key: 'assets/quotes.json',
      Body: JSON.stringify(quotes),
      ACL: "public-read"
    }).promise();
  }

  function deletePhoto(key) {
    return s3Bucket.deleteObject({Key: key}).promise();
  }

  function listUploads() {
    try {
      photoInputList.innerHTML = Array.from(fileInput.files).map((file) => {
        if (!isPhoto(file.name)) {
          photoForm.reset();
          throw "One of uploads is not an image?";
        };
        return (
          `<div class="photo-group">
            <label for="caption-${file.name}">${file.name}: </label>
            <br />
            <input name="caption-${file.name}" type="text" placeholder='description of photo' size=40 required=""/>
            <select name="category-${file.name}">
              ${
                Object.keys(categoryULs).map(
                  (category) => `<option value="${category}">${capitalized(category)}</option>`
                ).join('')
              }
            </select>
          </div><br />`
        );
      }).join('')
    } catch(err) {
      return alert('Failure: ' + err);
    }
    photoFormButtons.style.display = fileInput.files.length ? 'block': 'none';
  }


  // UI / TEMPLATES


  const listBucketObjects = (category) => (data) => {
    categoryULs[category].innerHTML = '';
    for (let item of data.Contents) {
      if (item.Size) {
        const picName = item.Key.split('/').reverse()[0];
        const caption = captions[picName];
        var newLI = document.createElement('li');
        newLI.innerHTML = `
          <h4>
            File: ${picName}
            <button onclick="th.deletePhotoFromElement(this.parentElement.parentElement, '${picName}');">Delete Photo</button>
            <button onclick="th.toggleEditCaption(this.parentElement.parentElement);">Edit Caption</button>
          </h4>
          Caption:
          <input type="text" value="${caption || ''}" style="border: none; pointer-events: none;" size=${caption && caption.length > 40 ? caption.length : 40}/>
          <button onclick="th.editCaption(this, '${picName}')" style="display: none;">Submit</button>
        `
        categoryULs[category].appendChild(newLI);
      }
    }
  }

  function displayQuoteList() {
    quoteList.innerHTML = quotes.map(([quote, author]) =>
      `<li>
        "<span>${quote}</span>" - <span>${author}</span>
        <button onclick="th.deleteQuote(this.parentElement)">Delete quote</button>
      </li>`
    ).join('');
  }

  function queryBucketCategories() {
    return s3Bucket.listObjectsV2({
      Prefix: 'assets/',
      Delimiter: '/'
    }).promise()
      .then((data) => {
        let categories = data.CommonPrefixes.map((item) => item.Prefix.split('/')[1])
        bucketContents.innerHTML = categories.map(
          (category) => `<h3>${capitalized(category)}</h3><ul id="${category}"></ul>`
        ).join('')
        categoryULs = categories.reduce((obj, category) => (
          obj[category] = document.getElementById(category),
          obj
        ), {});
      })
  }

  function queryQuotes(callback) {
    return s3Bucket.getObject({Key: 'assets/quotes.json'})
      .promise()
      .then((quotesData) => {
        quotes = JSON.parse(quotesData.Body.toString('utf-8'));
        displayQuoteList();
      });
  }

  function queryCaptions(callback) {
    return s3Bucket.getObject({Key: 'assets/captions.json'})
      .promise()
      .then((captionsData) => {
        captions = JSON.parse(captionsData.Body.toString('utf-8'));
      });
  }

  function onLoad() {
    document.firstElementChild.style.pointerEvents = 'none';
    successModal = document.getElementById('success-modal');
    fileInput = document.getElementById('files-input');
    photoInputList = document.getElementById('photo-input-list');
    photoForm = document.getElementById('photo-form');
    bucketContents = document.getElementById('bucket-contents');
    photoFormButtons = document.getElementById('photo-form-buttons');
    quoteList = document.getElementById('quote-list');
    quoteForm = document.getElementById('quote-form');
    quoteInputList = document.getElementById('quote-input-list');
    submitQuotesButton = document.getElementById('submit-quotes');

    Promise.all([queryBucketCategories(), queryCaptions(), queryQuotes()]).then(() => {
      fileInput.addEventListener('change', listUploads);
      photoForm.addEventListener('submit', photoFormSubmit);
      quoteForm.addEventListener('submit', quoteFormSubmit);
      document.getElementById('querybucket').addEventListener('click', th.queryPhotos);
      document.getElementById('new-quote-button').addEventListener('click', th.addQuoteInput);
      document.firstElementChild.style.pointerEvents = 'auto';
      // queryPhotos();
    }).catch((err) => alert(err))
  }

  function success() {
    successModal.style.display = 'block';
    setTimeout(() => {
      successModal.style.display = 'none';
    }, 3000);
  }

  function capitalized(string) {
    return string[0].toUpperCase() + string.slice(1);
  }

  function isPhoto(filename) {
    const imgs = ['png', 'jpg', 'jpeg', 'gif'];
    let extension = filename.split('.').reverse()[0].toLowerCase();
    return imgs.includes(extension);
  }

  document.addEventListener('DOMContentLoaded', onLoad);

  return {
    resetUploadForm: function() {
      photoForm.reset()
      photoInputList.innerHTML = '';
      photoFormButtons.style.display = 'none';
    },
    queryPhotos: function() {
      function queryCategoryPhotos(category) {
        return s3Bucket.listObjectsV2({
            Prefix: `assets/${category}/`,
            Delimiter: '/'
          })
          .promise()
          .then(listBucketObjects(category))
      }
      return Promise.all(Object.keys(categoryULs).map(queryCategoryPhotos));
    },
    addQuoteInput: function() {
      if (!quoteInputList.children.length) {
        submitQuotesButton.style.display = "block";
      }
      const liEl = document.createElement('li');
      liEl.innerHTML =
       `<input type="text" placeholder="quote" size=40 required=""/> -
        <input type="text" placeholder="author"/>
        <button onclick="th.removeQuoteInput(this.parentElement);">x</button>`
      quoteInputList.appendChild(liEl);
    },
    deleteQuote: function(quoteElement) {
      const quote = quoteElement.firstElementChild.innerText;
      const author = quoteElement.firstElementChild.nextElementSibling.innerText;
      if (!confirm(`Delete quote by ${author}?`)) return;

      const oldQuotes = quotes.slice();
      quotes = quotes.filter(([q, a]) => q !== quote || a !== author);

      uploadQuotes()
        .then(() => {
          success();
          quoteElement.remove();
          displayQuoteList();
        })
        .catch((err) => {
          quotes = oldQuotes;
          alert('Failure: ' + err);
        })
    },
    removeQuoteInput: function(target) {
      target.remove();
      if (!quoteInputList.children.length) {
        submitQuotesButton.style.display = "none";
      }
    },
    editCaption: function(buttonEl, picName) {
      const newCaption = buttonEl.previousElementSibling.value;
      if (!newCaption) return alert('Cannot be empty');
      const oldCaptions = {...captions};
      captions[picName] = newCaption;
      uploadCaptions()
        .then(() => {
          success();
          th.toggleEditCaption(buttonEl.parentElement);
        })
        .catch((err) => {
          captions = oldCaptions;
          alert('Failure: ' + err);
        });
    },
    deletePhotoFromElement: function(element, basename) {
      if (!confirm(`Delete ${basename}?`)) return;
      const category = element.parentElement.id;
      const key = `assets/${category.toLowerCase()}/${basename}`;
      deletePhoto(key)
        .then(() => {
          success();
          delete captions[basename];
          element.remove();
        })
        .catch((err) => {
          alert('Failure: ' + err);
        });
    },
    toggleEditCaption: function(el) {
      const submitButton = el.lastElementChild;
      const input = submitButton.previousElementSibling;
      if (input.style.borderStyle === 'none') {
        input.style.borderStyle = 'inset';
        input.style.pointerEvents = 'auto';
        submitButton.style.display = 'inline';
      } else {
        input.style.borderStyle = 'none';
        input.style.pointerEvents = 'none';
        submitButton.style.display = 'none';
      }
    }

  };
})(window);
