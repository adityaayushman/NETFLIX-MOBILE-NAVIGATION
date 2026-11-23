const open_btn = document.querySelector('.open-btn')
const close_btn = document.querySelector('.close-btn')
const menu = document.querySelector('#menu')
const nav = document.querySelectorAll('.nav')
// Everything on the page except the menu itself
const page = document.querySelectorAll('body > :not(#menu):not(script)')

function setMenu(isOpen) {
    nav.forEach(nav_el => nav_el.classList.toggle('visible', isOpen))
    menu.inert = !isOpen
    // Keep focus inside the menu while it is open
    page.forEach(el => { el.inert = isOpen })
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
    if (menu.inert) return

    if (e.key === 'Escape') {
        setMenu(false)
    } else if (e.key === 'Tab') {
        // Wrap Tab / Shift+Tab so focus cycles within the menu
        const focusable = menu.querySelectorAll('button, a[href]')
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
        }
    }
})
