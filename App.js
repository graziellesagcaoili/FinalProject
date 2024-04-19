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
import * as ImagePicker from 'expo-image-picker';

const App = () => {
    const [contacts, setContacts] = useState([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [twitter, setTwitter] = useState('');
    const [imageUri, setImageUri] = useState('');
    const [editingContact, setEditingContact] = useState(null);



    // Initialize the database
    const db = SQLite.openDatabase("Contacts8.db");

    // Create the table if it doesn't exist
    const createTable = () => {
        db.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS Contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, instagram TEXT, facebook TEXT, twitter TEXT);',
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
        if (!name.trim() || !phone.trim() || !facebook.trim() || !instagram.trim() || !twitter.trim()) {
            Alert.alert('Please enter name, phone number, and social media links.');
            return;
        }

        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO Contacts (name, phone, facebook, instagram, twitter) VALUES (?, ?, ?, ?, ?);',
                [name, phone, facebook, instagram, twitter],
                (_, { rowsAffected, insertId }) => {
                    if (rowsAffected > 0) {
                        setContacts([...contacts, { id: insertId, name, phone, facebook, instagram, twitter }]);
                        setName('');
                        setPhone('');
                        setFacebook('');
                        setInstagram('');
                        setTwitter('');
                        setImageUri('');
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
        if (!name.trim() || !phone.trim() || !facebook.trim() || !instagram.trim() || !twitter.trim()) {
            Alert.alert('Please enter both name and phone number.');
            return;
        }

        db.transaction(tx => {
            tx.executeSql(
                'UPDATE Contacts SET name=?, phone=?, facebook=?, instagram=?, twitter=? WHERE id=?;',
                [name, phone, facebook, instagram, twitter, editingContact.id],
                (_, { rowsAffected }) => {
                    if (rowsAffected > 0) {
                        setContacts(
                            contacts.map(contact => (contact.id === editingContact.id ? { ...contact, name, phone, facebook, instagram, twitter } : contact))
                        );
                        Alert.alert('Contact updated successfully');
                        setEditingContact(null);
                        setName('');
                        setPhone('');
                        setFacebook('');
                        setInstagram('');
                        setTwitter('');
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

    //Editing the contact
    const handleEditContact = contact => {
        setName(contact.name);
        setPhone(contact.phone);
        setFacebook(contact.facebook || ''); 
        setInstagram(contact.instagram || ''); 
        setTwitter(contact.twitter || ''); 
        setEditingContact(contact);
    };


    //picking the image
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setImageUri(result.uri);
        }
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
                    placeholder="Facebook"
                    value={facebook}
                    onChangeText={setFacebook}
                    style={styles.input}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Instagram"
                    value={instagram}
                    onChangeText={setInstagram}
                    style={styles.input}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Twitter"
                    value={twitter}
                    onChangeText={setTwitter}
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
                {contacts.map(({ id, name, phone, instagram, facebook, twitter }) => (
                    <View key={id} style={styles.contactItem}>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactName}>{name}</Text>
                            <Text style={styles.contactPhone}>{phone}</Text>
                            {instagram ? (
                                <TouchableOpacity onPress={() => handleOpenLink(`https://instagram.com/${instagram}`)}>
                                    <Text style={styles.socialLink}>{instagram}</Text>
                                </TouchableOpacity>
                            ) : null}
                            {facebook ? (
                                <TouchableOpacity onPress={() => handleOpenLink(`https://facebook.com/${facebook}`)}>
                                    <Text style={styles.socialLink}>{facebook}</Text>
                                </TouchableOpacity>
                            ) : null}
                            {twitter ? (
                                <TouchableOpacity onPress={() => handleOpenLink(`https://twitter.com/${twitter}`)}>
                                    <Text style={styles.socialLink}>{twitter}</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        <View style={styles.buttonsContainer}>
                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity onPress={() => handleEditContact({ id, name, phone, facebook, instagram, twitter })}>
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
