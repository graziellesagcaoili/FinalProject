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
import { Alert, StatusBar, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity, Linking } from 'react-native';
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
                <TouchableOpacity style={styles.button} onPress={handleAddOrUpdateContact}>
                    <Text style={styles.buttonText}>
                        {editingContact ? 'Update Contact' : 'Add Contact'}
                    </Text>
                </TouchableOpacity>
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
                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity onPress={() => handleEditContact({ id, name, phone })}>
                                    <Text>Edit</Text> 
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteContact(id)} style={{ marginLeft: 10 }}>
                                    <Text>Delete</Text>
                                </TouchableOpacity>
                            </View>

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
        backgroundColor: '#f7f7f7',
        paddingTop: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1c313a',
        padding: 20,
    },
    inputContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 10,
        marginVertical: 5,
        elevation: 1, // Add shadow for Android
        // Add shadow for iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    listContainer: {
        flex: 1,
        marginTop: 10,
    },
    contactItem: {
        backgroundColor: '#fff',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginHorizontal: 10,
        borderRadius: 5,
        marginTop: 5,
        elevation: 1, // Add shadow for Android
        // Add shadow for iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
    },
    contactPhone: {
        fontSize: 16,
        color: '#555',
    },
    socialLink: {
        color: '#1c313a',
        textDecorationLine: 'underline',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#1c313a',
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
});



export default App;
