const moreBtn = document.querySelector('#more-btn')
const sheet = document.querySelector('#sheet')
const sheetClose = document.querySelector('#sheet-close')
const backdrop = document.querySelector('#backdrop')
const tabs = document.querySelectorAll('.tabbar a.tab')
// Everything behind the sheet that should be unreachable while it is open
const behind = document.querySelectorAll('.topbar, .content, .tabbar')

function setSheet(isOpen) {
    backdrop.hidden = false
    // Next frame, so the opacity transition runs
    requestAnimationFrame(() => backdrop.classList.toggle('visible', isOpen))
    if (!isOpen) {
        setTimeout(() => { backdrop.hidden = !backdrop.classList.contains('visible') }, 250)
    }

    sheet.classList.toggle('visible', isOpen)
    sheet.inert = !isOpen
    behind.forEach(el => { el.inert = isOpen })
    moreBtn.setAttribute('aria-expanded', String(isOpen))

    // Focus moves into the sheet on open and back to the trigger on close
    if (isOpen) {
        sheetClose.focus()
    } else {
        moreBtn.focus()
    }
}

moreBtn.addEventListener('click', () => setSheet(true))
sheetClose.addEventListener('click', () => setSheet(false))
backdrop.addEventListener('click', () => setSheet(false))

// Choosing a link in the sheet closes it; the link still navigates
sheet.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        setSheet(false)
        tabs.forEach(t => t.removeAttribute('aria-current'))
    })
})

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.removeAttribute('aria-current'))
        tab.setAttribute('aria-current', 'page')
    })
})

document.addEventListener('keydown', e => {
    if (sheet.inert) return

    if (e.key === 'Escape') {
        setSheet(false)
    } else if (e.key === 'Tab') {
        // Wrap Tab / Shift+Tab so focus cycles within the sheet
        const focusable = sheet.querySelectorAll('button, a[href]')
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
