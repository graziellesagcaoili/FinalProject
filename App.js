/* App.js
 * Created by: Grazielle Agcaoili
 * Date: April 11, 2024
 * About: Contact Repository with social media links
 * Update: added db (April 12, 2024)
 *          CRUD added (April 15, 2024)
 * 
 * 
 * 
 *
 */


import React, { useState, useEffect } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity, Linking } from 'react-native';
import * as SQLite from 'expo-sqlite';

const App = () => {
    const [contacts, setContacts] = useState([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [social, setSocial] = useState('');
    const [editingContact, setEditingContact] = useState(null);



    // Initialize the database
    const db = SQLite.openDatabase("Contacts.db");

    // Create the table if it doesn't exist
    const createTable = () => {
        db.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS Contacts1 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, social TEXT);',
                [],
                () => console.log('Table created'),
                (_, error) => console.log('Error @createTable: ', error)
            );
        });
    };

    // Fetch data from the database
    const fetchData = () => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM Contacts;',
                [],
                (_, { rows: { _array } }) => setContacts(_array),
                (_, error) => console.log('Error @fetchData: ', error)
            );
        });
    };

    useEffect(() => {
        createTable();
        fetchData();
    }, []);

    // Add a new contact to the database
    const addContact = () => {
        if (!name.trim() || !phone.trim() || !social.trim()) {
            Alert.alert('Please enter name, phone number, and social media link.');
            return;
        }

        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO Contacts1 (name, phone, social) VALUES (?, ?, ?);',
                [name, phone, social],
                (_, { rowsAffected, insertId }) => {
                    if (rowsAffected > 0) {
                        setContacts([...contacts, { id: insertId, name, phone }]);
                        setName('');
                        setPhone('');
                        Alert.alert('Contact added successfully');
                    } else {
                        Alert.alert('Failed to add contact');
                    }
                },
                (_, error) => console.log('Error @addContact: ', error)
            );
        });
    };

    //update contact
    const updateContact = () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert('Please enter both name and phone number.');
            return;
        }

        db.transaction(tx => {
            tx.executeSql(
                'UPDATE Contacts SET name=?, phone=?, social=? WHERE id=?;',
                [name, phone, social, editingContact.id],
                (_, { rowsAffected }) => {
                    if (rowsAffected > 0) {
                        setContacts(
                            contacts.map(contact => (contact.id === editingContact.id ? { ...contact, name, phone } : contact))
                        );
                        Alert.alert('Contact updated successfully');
                        setEditingContact(null);
                        setName('');
                        setPhone('');
                    } else {
                        Alert.alert('Failed to update contact');
                    }
                },
                (_, error) => console.log('Error @updateContact: ', error)
            );
        });
    };

    const handleOpenLink = (url) => {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert("Don't know how to open URI: " + url);
            }
        });
    };

    // Delete a contact from the database
    const deleteContact = (id) => {
        db.transaction(tx => {
            tx.executeSql(
                'DELETE FROM Contacts WHERE id = ?;',
                [id],
                (_, { rowsAffected }) => {
                    if (rowsAffected > 0) {
                        setContacts(contacts.filter(contact => contact.id !== id));
                        Alert.alert('Contact deleted successfully');
                    } else {
                        Alert.alert('Failed to delete contact');
                    }
                },
                (_, error) => console.log('Error @deleteContact: ', error)
            );
        });
    };

    // Button press handlers
    const handleAddOrUpdateContact = () => {
        if (editingContact) {
            updateContact();
        } else {
            addContact();
        }
    };


    const handleEditContact = contact => {
        setName(contact.name);
        setPhone(contact.phone);
        setEditingContact({ id: contact.id, name: contact.name, phone: contact.phone });
    };


  
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Contact Directory</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    keyboardType="phone-pad"
                />
                <TextInput
                    placeholder="Social Media Link"
                    value={social}
                    onChangeText={setSocial}
                    style={styles.input}
                    autoCapitalize="none"
                />
                <Button title={editingContact ? "Update Contact" : "Add Contact"} onPress={handleAddOrUpdateContact} color="#1c313a" />
            </View>
            <ScrollView style={styles.listContainer}>
                {contacts.map(({ id, name, phone }) => (
                    <View key={id} style={styles.contactItem}>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactName}>{name}</Text>
                            <Text style={styles.contactPhone}>{phone}</Text>
                            {social ? (
                                <TouchableOpacity onPress={() => handleOpenLink(social)}>
                                    <Text style={styles.socialLink}>{social}</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        <View style={styles.buttonsContainer}>
                            <Button title="Edit" onPress={() => handleEditContact({ id, name, phone })} color="#1c313a" />
                            <Button title="Delete" onPress={() => deleteContact(id)} color="#e53935" />
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 30,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1c313a',
        paddingTop: 50,
        paddingBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'space-between',
    },
    input: {
        borderWidth: 1,
        borderColor: '#1c313a',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        marginRight: 10,
        marginBottom: 10,
    },
    listContainer: {
        flex: 1,
    },
    contactItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 18,
        color: '#1c313a',
    },
    contactPhone: {
        fontSize: 16,
        color: '#666',
    },
    socialLink: {
        color: '#0645AD',
        textDecorationLine: 'underline',
    },
});

export default App;
