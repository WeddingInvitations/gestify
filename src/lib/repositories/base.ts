import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
  Firestore,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { adminDb } from '@/lib/firebase/admin'
import { BaseEntity, WithoutId, WithoutTimestamps } from '@/types'

export interface QueryOptions {
  limit?: number
  orderBy?: { field: string; direction: 'asc' | 'desc' }[]
  startAfter?: DocumentSnapshot
  where?: { field: string; operator: any; value: any }[]
}

export interface PaginationResult<T> {
  data: T[]
  hasMore: boolean
  lastDoc?: DocumentSnapshot
  total?: number
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected collectionName: string
  protected isSubcollection: boolean

  constructor(collectionName: string, isSubcollection = false) {
    this.collectionName = collectionName
    this.isSubcollection = isSubcollection
  }

  /**
   * Obtener referencia de colección (solo client-side)
   */
  protected getCollectionRef(tenantId: string) {
    if (this.isSubcollection) {
      return collection(db, 'companies', tenantId, this.collectionName)
    }
    return collection(db, this.collectionName)
  }

  /**
   * Obtener referencia de documento (solo client-side)
   */
  protected getDocRef(id: string, tenantId?: string) {
    if (this.isSubcollection && tenantId) {
      return doc(db, 'companies', tenantId, this.collectionName, id)
    }
    return doc(db, this.collectionName, id)
  }

  /**
   * Convertir datos de Firestore a entidad
   */
  protected abstract fromFirestore(doc: DocumentSnapshot): T | null

  /**
   * Convertir entidad a datos de Firestore
   */
  protected abstract toFirestore(entity: WithoutId<WithoutTimestamps<T>>): any

  /**
   * Obtener documento por ID
   */
  async findById(id: string, tenantId: string): Promise<T | null> {
    try {
      const docRef = this.getDocRef(id, tenantId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        return null
      }

      return this.fromFirestore(docSnap)
    } catch (error) {
      console.error(`Error finding ${this.collectionName} by ID:`, error)
      throw error
    }
  }

  /**
   * Obtener múltiples documentos con filtros
   */
  async find(
    tenantId: string, 
    options: QueryOptions = {}
  ): Promise<PaginationResult<T>> {
    try {
      const colRef = this.getCollectionRef(tenantId)
      const constraints: QueryConstraint[] = []

      // Agregar filtro por tenant si no es subcollection
      if (!this.isSubcollection) {
        constraints.push(where('tenantId', '==', tenantId))
      }

      // Agregar filtros where
      if (options.where) {
        options.where.forEach(w => {
          constraints.push(where(w.field, w.operator, w.value))
        })
      }

      // Agregar ordenamiento
      if (options.orderBy) {
        options.orderBy.forEach(o => {
          constraints.push(orderBy(o.field, o.direction))
        })
      } else {
        // Ordenamiento por defecto
        constraints.push(orderBy('createdAt', 'desc'))
      }

      // Agregar límite
      if (options.limit) {
        constraints.push(limit(options.limit))
      }

      // Agregar cursor para paginación
      if (options.startAfter) {
        constraints.push(startAfter(options.startAfter))
      }

      const q = query(colRef, ...constraints)
      const querySnapshot = await getDocs(q)

      const data = querySnapshot.docs
        .map(doc => this.fromFirestore(doc))
        .filter(item => item !== null) as T[]

      const hasMore = querySnapshot.docs.length === (options.limit || 20)
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]

      return {
        data,
        hasMore,
        lastDoc,
      }
    } catch (error) {
      console.error(`Error finding ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Crear nuevo documento
   */
  async create(
    data: WithoutId<WithoutTimestamps<T>>, 
    tenantId: string
  ): Promise<T> {
    try {
      const colRef = this.getCollectionRef(tenantId)
      const now = Timestamp.now()
      
      const firestoreData = {
        ...this.toFirestore(data),
        tenantId,
        createdAt: now,
        updatedAt: now,
      }

      const docRef = await addDoc(colRef, firestoreData)
      
      // Obtener el documento creado
      const createdDoc = await getDoc(docRef)
      const result = this.fromFirestore(createdDoc)
      
      if (!result) {
        throw new Error('Failed to create document')
      }

      return result
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Actualizar documento existente
   */
  async update(
    id: string, 
    data: Partial<WithoutTimestamps<T>>, 
    tenantId: string
  ): Promise<T> {
    try {
      const docRef = this.getDocRef(id, tenantId)
      
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      }

      await updateDoc(docRef, updateData)
      
      // Obtener el documento actualizado
      const updatedDoc = await getDoc(docRef)
      const result = this.fromFirestore(updatedDoc)
      
      if (!result) {
        throw new Error('Document not found after update')
      }

      return result
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Eliminar documento
   */
  async delete(id: string, tenantId: string): Promise<void> {
    try {
      const docRef = this.getDocRef(id, tenantId)
      await deleteDoc(docRef)
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error)
      throw error
    }
  }

  /**
   * Conteo de documentos (solo admin)
   */
  async count(tenantId: string, filters: QueryOptions['where'] = []): Promise<number> {
    try {
      const result = await this.find(tenantId, { where: filters, limit: 1000 })
      return result.data.length
    } catch (error) {
      console.error(`Error counting ${this.collectionName}:`, error)
      return 0
    }
  }
}