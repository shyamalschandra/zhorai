/* -------------- Initialize variables -------------- */
var zhoraiTextColour = "#5d3e9f";
var animalPromptLabel;
var recordButton;
var zhoraiSpeechBox;
var loadingGif;
var currBtnIsMic = true;
var mindmapPath = "../../website-server-side/receive-text/data/mindmap.txt";
var currentAnimal = "";
var knownAnimals = ['bees',
    'birds',
    'butterflies',
    'leopards',
    'cows',
    'owls',
    'fireflies',
    'dolphins',
    'fish',
    'lobsters',
    'starfish',
    'swordfish',
    'whales',
    'polarbears',
    'arcticfoxes',
    'yaks',
    'reindeer',
    'camels',
    'scorpions',
    'elephants',
    'giraffes',
    'lions'
];
var oldAnimals = [];

// File paths for saving animal info
var animalDir = 'animals/';

/* -------------- Initialize functions -------------- */
function showPurpleText(text) {
    zhoraiSpeechBox.innerHTML = '<p style="color:' + zhoraiTextColour + '">' + text + '</p>';
}

/**
 * Replaces "Zhorai" with "Zor-eye":
 * @param {*} text
 */
function makePhonetic(text) {
    text = text.replace(/Zhorai/gi, 'Zor-eye');
    text = text.replace(/Zorai/gi, 'Zor-eye');
    text = text.replace(/Zohrai/gi, 'Zor-eye');
    text = text.replace(/Zoreye/gi, 'Zor-eye');
    return text;
}

/**
 * Returns list of english voices:
 */
function getEnglishVoices() {
    englishVoices = [];
    speechSynthesis.getVoices().forEach(function (voice) {
        if (voice.lang.includes("en")) {
            englishVoices.push(voice);
        }
    });
    return englishVoices;
}

/**
 * Switches the button to the specified button (either 'micBtn' or 'speakBtn')
 * @param {*} toButton
 */
function switchButtonTo(toButton) {
    if (toButton == 'micBtn') {
        recordButton.hidden = false;
        loadingGif.hidden = true;
        textFileBtn.hidden = true;
        currBtnIsMic = true;
    } else if (toButton == 'speakBtn') {
        recordButton.hidden = true;
        loadingGif.hidden = true;
        textFileBtn.hidden = true;
        currBtnIsMic = false;
    } else if (toButton == 'loading') {
        loadingGif.hidden = false;
        recordButton.hidden = true;
        textFileBtn.hidden = true;
        currBtnIsMic = false;
    } else if (toButton == 'textFileBtn') {
        textFileBtn.hidden = false;
        loadingGif.hidden = true;
        recordButton.hidden = true;
        currBtnIsMic = false;
    } else if (toButton == 'micAndTextFileBtn') {
        textFileBtn.hidden = false;
        recordButton.hidden = false;
        loadingGif.hidden = true;
        currBtnIsMic = true;
    } else if (!toButton) {
        console.log('No button specified. Not switching button.');
    } else {
        console.error('Unknown button: ' + toButton + '. Did not switch button.');
    }
}

function mod2ReceiveData(filedata) {
    // We're done parsing and reading the mindmap text file!
    // create the mindmap!
    console.log('Creating mindmap! filedata:');
    filedata = filedata.replace(/'/g, '"');
    console.log(filedata);
    console.log(JSON.parse(filedata));

    // save animal info to file for the next module:
    makeTextFile(animalDir + currentAnimal + '.txt');

    clearMemory(); // note: maketextfile clears the mem in receiver.js already ;P
    switchButtonTo('micAndTextFileBtn');
    createMindmap(JSON.parse(filedata));

    // Now let's teach zhorai about another animal :)
    // Add the current animal to the list of oldAnimals:
    oldAnimals.push(currentAnimal);
    currentAnimal = chooseRandomPhrase(knownAnimals.filter(checkNewAnimal));
    // todo: what if we go through all 22 animals?

    // update the prompts with the new animal
    setAnimalPrompt(currentAnimal);
}

function checkNewAnimal(animal) {
    return !(oldAnimals.includes(animal));
}

function setAnimalPrompt() {
    animalPromptLabel.innerHTML = "Zhorai would like to know about <span style=\"text-decoration: underline;\">" +
        currentAnimal + "</span>. Could you teach it about them?";
    textFileLabel.innerHTML = "Once you're done teaching Zhorai about " +
        currentAnimal + ", click the button below.";
}

/* -------------- Once the page has loaded -------------- */
document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables:
    currStage = 0;
    animalPromptLabel = document.getElementById('animalPromptLabel');
    recordButton = document.getElementById('record_button');
    zhoraiSpeechBox = document.getElementById('final_span');
    loadingGif = document.getElementById('loadingGif');
    textFileLabel = document.getElementById('textFileLabel');
    textFileBtn = document.getElementById('textFileBtn');
    currentAnimal = chooseRandomPhrase(knownAnimals);

    setAnimalPrompt();

    // remove any memory from previous activites:
    clearMemory("input.txt");

    // Add click handlers
    record_button.addEventListener("click", recordButtonClick);
    textFileBtn.addEventListener('click', function () {
        switchButtonTo('loading');
        // say something about how we're going to display Zhorai's thoughts after parsing
        var phrases = ['Thanks for teaching me about ' + currentAnimal + '! Let me think about all these new things and show you my thoughts.',
            "Wow, " + currentAnimal + " sound really interesting! Let me think for a bit and then I'll show you my thoughts.",
            currentAnimal + " sound fascinating! Now I want to visit earth and all of it's life! I'll show you what I understand after I think for a little while."
        ];
        var toSpeak = chooseRandomPhrase(phrases);
        showPurpleText(toSpeak);
        speakText(toSpeak);

        // delete the current mindmap to prepare for the next
        deleteMindmap();

        // send a command to the server to parse what's in the memory,
        parseMem('mindmap', null, 'parsing' + '_mod2');
        // when done parsing, create the mind map (in mod2ReceiveData)
    });
});