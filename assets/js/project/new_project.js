class LinkedSelect {
    /**
    * @param {HTMLSelectElement} $select
    */
    constructor($select) {
        this.$select = $select
        this.$target = document.querySelector(this.$select.getAttribute('data-target'))
        this.$placeholder = this.$target.firstElementChild
        this.onChange = debounce(this.onChange.bind(this), 500)
        this.$select.addEventListener('change', this.onChange)
    }

    onChange(e) {
        // On récupère les données en AJAX
        let xhr = new XMLHttpRequest()
        xhr.open('GET', this.$select.dataset.source.replace('$id', e.target.value), true)
        xhr.onload = () => {
            if (xhr.status == 200) {
                let data = JSON.parse(xhr.responseText)
                let options = data.reduce(function(acc, option) {
                    return acc + '<option value="'+ option.value +'">'+ option.label +'</option>'
                }, '')
                this.$target.innerHTML = options
                this.$target.insertBefore(this.$placeholder, this.$target.firstChild)
                this.$target.selectedIndex = 0
                this.$target.style.display = null;
            } else {
                alert('Une erreur est survenue...')
            }
        }
        xhr.onerror = function () {
            alert('Impossible de charger la liste')
        }
        xhr.send()
    }
}

let $selects = document.querySelectorAll('.linked_select')

$selects.forEach(function($select) {
    new LinkedSelect($select)
})

function debounce(callback, delay) {
    let timer;
    return function () {
        let args = arguments;
        let context = this;
        clearTimeout(timer);
        timer = setTimeout(function() {
            callback.apply(context, args);
        }, delay)
    }
}