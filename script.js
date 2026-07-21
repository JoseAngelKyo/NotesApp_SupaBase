
const noteForm = document.getElementById('note-form')
const notesGrid = document.getElementById('notes-grid')
const statusMessage = document.getElementById('status-message')

const categoriaIconos = {
    'General': '<i class="fa-solid fa-bookmark"></i>',
    'Ideas': '<i class="fa-solid fa-lightbulb"></i>',
    'Personal': '<i class="fa-solid fa-user"></i>',
    'Estudio': '<i class="fa-solid fa-graduation-cap"></i>'
}

async function obtenerNotas() {
    try {
        const { data: notas, error } = await _supabase
            .from('notas')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        statusMessage.className = 'status-box status-success'
        statusMessage.innerHTML = '<i class="fa-solid fa-circle-check"></i> Conexión activa con Supabase'

        notesGrid.innerHTML = ''

        if (notas.length === 0) {
            notesGrid.innerHTML = `
                <div class="empty-state">
                  <i class="fa-regular fa-folder-open"></i>
                  <p>No tienes notas guardadas aún. ¡Crea la primera arriba!</p>
                </div>
            `
            return
        }

        notas.forEach(nota => {
            const card = document.createElement('div')
            const catLimpia = nota.categoria || 'General'
            const iconoCat = categoriaIconos[catLimpia] || '<i class="fa-solid fa-tag"></i>'

            card.className = `note-card cat-${catLimpia.toLowerCase()}`
            card.innerHTML = `
                <div class="card-top">
                    <span class="badge badge-${catLimpia.toLowerCase()}">${iconoCat} ${catLimpia}</span>
                    <div style="display:flex; align-items:center; gap: 0.5rem;">
                        <span class="card-date"><i class="fa-regular fa-clock"></i> ${new Date(nota.created_at || Date.now()).toLocaleDateString()}</span>
                        <button onclick="eliminarNota(${nota.id})" class="btn-delete" title="Eliminar nota"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <h3 class="card-title">${nota.titulo}</h3>
                <p class="card-content">${nota.contenido}</p>
            `
            notesGrid.appendChild(card)
        })
    } catch (error) {
        console.error('Error detallado:', error)
        statusMessage.className = 'status-box status-error'
        statusMessage.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error de conexión con Supabase'
    }
}

async function eliminarNota(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
        try {
            const { error } = await _supabase
                .from('notas')
                .delete()
                .eq('id', id)

            if (error) throw error

            obtenerNotas()
        } catch (error) {
            alert('No se pudo eliminar la nota. Revisa los permisos RLS en Supabase.')
            console.error('Error al eliminar:', error)
        }
    }
}

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const titulo = document.getElementById('titulo').value
    const contenido = document.getElementById('contenido').value
    const categoria = document.getElementById('categoria').value

    try {
        const { error } = await _supabase
            .from('notas')
            .insert([{ titulo, contenido, categoria }])

        if (error) throw error

        noteForm.reset()
        obtenerNotas()
    } catch (error) {
        alert('Error al guardar la nota. Revisa la consola.')
        console.error('Error al insertar:', error)
    }
})

obtenerNotas()