import { useState, useEffect } from 'react'
import Builder from '../DragAndDrop/Builder'
import { superRecipeApi } from '../../api'
import { toast } from 'react-hot-toast'

export default function BudgetBuilderWrapper () {
  const [superRecipes, setSuperRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuperRecipes()
  }, [])

  const fetchSuperRecipes = async () => {
    try {
      const data = await superRecipeApi.getAll()
      setSuperRecipes(data)
    } catch {
      toast.error('Error al cargar las súper recetas para los presupuestos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className='p-8 text-center text-gray-500'>Cargando constructor de presupuestos...</div>
  }

  return <Builder mode='budget' availableItems={superRecipes} />
}
