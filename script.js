const open_btn = document.querySelector('.open-btn')
const close_btn = document.querySelector('.close-btn')
const menu = document.querySelector('#menu')
const nav = document.querySelectorAll('.nav')

function setMenu(isOpen) {
    nav.forEach(nav_el => nav_el.classList.toggle('visible', isOpen))
    menu.inert = !isOpen
    open_btn.setAttribute('aria-expanded', String(isOpen))

    // Move focus into the menu on open and back to the trigger on close
    if (isOpen) {
        close_btn.focus()
    } else {
        open_btn.focus()
    }
}

open_btn.addEventListener('click', () => setMenu(true))

close_btn.addEventListener('click', () => setMenu(false))

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.inert) {
        setMenu(false)
    }
})
