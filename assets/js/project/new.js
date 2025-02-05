/*window.onload = () => {
	let project = document.getElementById('project');
	let regions = document.getElementById('project_region');
	let districts = document.getElementById('project_district');
	let communes = document.getElementById('project_commune');
	let name = document.getElementById('project_name');

	function manageChange(htmlSelectParent, htmlSelectChild, optionDefaultText, orderClass) {
		// Recupérer l'option choisie par l'internaute dans le parent
		const selectedHtmlSelectParent = htmlSelectParent.selectedOptions[0];

		// Recupérer la valeur de la classe du parent
		const selectedClass = selectedHtmlSelectParent.classList.value.split('.');

		// Initiliaser un compteur et un option par défaut
		let j = 0, optionDefault, optionDefaultValue = '';

		// Créer l'option par le défaut
		optionDefault = document.createElement('option');
		optionDefault.value = optionDefaultValue;
		optionDefault.text = optionDefaultText;

		// Parcourir l'élément select enfant pour n'afficher que les options correspondant l'élement select parent sélectionné
		for (let i = 0; i < htmlSelectChild.options.length; i++) {
			option = htmlSelectChild.options[i];
            optionClass = option.classList.value.split('.');
			if (selectedHtmlSelectParent.value == optionDefaultValue) {
				option.style.display = '';
			} else {
				if ( optionClass[orderClass] == selectedClass[orderClass] ) {
					if (j == 0) optionDefault = option;
					option.style.display = '';
					j++;
				} else {
					option.style.display = 'none';
				}
			}
		}
		// Mettre à jour la valeur par defaut sur l'option de l'élément enfant
		htmlSelectChild.selectedOptions[0].textContent = optionDefault.textContent;
		// optionDefault.text = optionDefaultText;
		// htmlSelectChild.selectedOptions[0].before(optionDefault)
	}
/*
	function manageParentChange(htmlSelectParent, htmlSelectChild, optionDefaultText, orderClass) {
		// Recupérer l'option choisie par l'internaute dans l'enfant
		const selectedHtmlSelectChild = htmlSelectChild.selectedOptions[0];

		// Recupérer la valeur de la classe de l'enfant
		const selectedClass = selectedHtmlSelectChild.classList.value.split(' ');
		console.log(selectedClass);

		// Initiliaser un compteur et un option par défaut
		let j = 0, optionDefault, optionDefaultValue = '';

		// Créer l'option par le défaut
		optionDefault = document.createElement('option');
		optionDefault.value = optionDefaultValue;
		optionDefault.text = optionDefaultText;
        console.log('cououc');

		// Parcourir l'élément select enfant pour n'afficher que les options correspondant l'élement select parent sélectionné
		for (let i = 0; i < htmlSelectParent.options.length; i++) {
			option = htmlSelectParent.options[i];
			if (selectedHtmlSelectChild.value == optionDefaultValue) {
				option.style.display = '';
			} else {
				if ( option.classList.contains(selectedClass[orderClass]) ) {
					if (j == 0) optionDefault = option;
					option.style.display = '';
					j++;
				} else {
					option.style.display = 'none';
				}
			}
		}
		// Mettre à jour la valeur par defaut sur l'option de l'élément enfant
		htmlSelectParent.selectedOptions[0].textContent = optionDefault.textContent;
	}
*/
/*
	regions.addEventListener('change', function() {
		manageChange(regions, districts, "----Choisir un district----", 0);
		manageChange(regions, communes, "----Choisir une commune----", 0);
		name.value = "Plof_" + communes.selectedOptions[0].textContent;
		//name.setAttribute('disabled', 'disabled')
	});

	districts.addEventListener('change', function(){
		manageChange(districts, communes, "----Choisir une commune----", 1);
		manageChange(districts, regions, "----Choisir une région----", 0);
		name.value = "Plof_" + communes.selectedOptions[0].textContent;
	});

	communes.addEventListener('change', function(){
		manageChange(communes, districts, "----Choisir une district----", 1);
		manageChange(communes, regions, "----Choisir une région----", 0);
		name.value = "Plof_" + communes.selectedOptions[0].textContent;
		//name.setAttribute('disabled', 'disabled')
	});
}
*/