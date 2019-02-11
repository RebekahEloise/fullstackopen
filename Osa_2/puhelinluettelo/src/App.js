import React, { useState, useEffect } from 'react'
import NewPerson from './components/AddPerson';
import FilterPerson from './components/FilterPerson';
import Persons from './components/Persons';
import personDB from './services/personDB';
import Notification from './components/Notification';


const App = () => {
  const [ persons, setPersons] = useState([]) 
  const [ newName, setNewName ] = useState('')
  const [ newNumber, setNewNumber ] = useState('')
  const [ newSearch, setNewSearch ] = useState('')
  const [ errorMessage, setErrorMessage ] = useState(null)

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleSearchChange = (event) => {
    setNewSearch(event.target.value)
  }

  const handleDeletePerson = (name, id) => {
    return () => {
        if (window.confirm(`Poistetaanko ${name} ?`)) {
            personDB.deletePerson(id)
            .then(() => {
                setPersons(persons.filter(n => n.id !== id))
                setErrorMessage(`Poistettiin ${name}`)
                setNewName('')
                setNewNumber('')
            });
            setTimeout(() => { 
                setErrorMessage(null)                
            }, 3000);
        }
    }
  }

  useEffect(() => {    
    personDB.getAll().then(response => { 
        setPersons(response)})
}, [])


  const addPerson = (event) => {
    event.preventDefault()

    const personObject = {
        name: newName,
        number: newNumber,
        id: persons.length + 1,
    }

    if (persons.filter(person => person.name === personObject.name).length > 0)  {
        if ( window.confirm(`${personObject.name} on jo luettelossa, korvataanko vanha numero uudella?`)) {
            const previousPerson = persons.find(n => n.name === newName)
            personDB.replace({...previousPerson, number: newNumber })
            .then(updatedPerson => {
                setPersons(persons.map(n => n.name === newName ? updatedPerson : n))
            }).catch(error => {
                setErrorMessage(error.response.data)
            })
            setPersons(persons.concat(personObject))
            setErrorMessage(`Muutettiin ${personObject.name} numero`)
            setNewName('')
            setNewNumber('')
            setTimeout(() => { 
                setErrorMessage(null) 
            }, 3000);
        }
    } else {
        personDB.create(personObject).then(newPerson => {
            setPersons(persons.concat(newPerson))
            setErrorMessage(`Lisättiin ${personObject.name}`)
            setNewName('')
            setNewNumber('')
        })
        .catch(error => {
            setErrorMessage(`${error.response.data.error}`)
            console.log(error.response.data)
          });
        setTimeout(() => { setErrorMessage(null) }, 3000);
    }
}

  return (
    <div>
        <h2>Puhelinluettelo</h2>
        <Notification message={errorMessage} />
        <FilterPerson newSearch={newSearch} handleSearchChange={handleSearchChange} />
        <h3>lisää uusi</h3>
        <NewPerson newName={newName} newNumber={newNumber} handleNameChange={handleNameChange} handleNumberChange={handleNumberChange} addPerson={addPerson} />
        <h3>Numerot</h3>
        <Persons persons={persons} newSearch={newSearch} handleDeletePerson={handleDeletePerson} />
    </div>
  )

}

export default App
