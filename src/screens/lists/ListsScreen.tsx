import React, {useState, useEffect} from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {Text, Dialog, TextInput, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../hooks/useTheme';
import {database, listsCollection} from '../../database';
import FAB from '../../components/FAB';
import {LIST_COLORS} from '../../theme/colors';

const ListsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {theme} = useTheme();
  const [lists, setLists] = useState<any[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(LIST_COLORS[4]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const subscription = listsCollection
      .query()
      .observe()
      .subscribe((l: any[]) => setLists(l.filter(li => !li.isSmart).sort((a, b) => a.sortOrder - b.sortOrder)));
    return () => subscription.unsubscribe();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setNewName('');
    setNewColor(LIST_COLORS[4]);
    setDialogVisible(true);
  };

  const openEditDialog = (list: any) => {
    setEditingId(list.id);
    setNewName(list.name);
    setNewColor(list.color);
    setDialogVisible(true);
  };

  const handleSave = async () => {
    if (!newName.trim()) return;
    const now = Date.now();
    await database.write(async () => {
      if (editingId) {
        const list = await listsCollection.find(editingId);
        await list.update(l => {
          l.name = newName.trim();
          l.color = newColor;
          l.updatedAt = now;
        });
      } else {
        await listsCollection.create(l => {
          l.name = newName.trim();
          l.color = newColor;
          l.icon = 'format-list-bulleted';
          l.sortOrder = now;
          l.isSmart = false;
          l.smartFilter = '';
          l.googleCalendarId = '';
          l.createdAt = now;
          l.updatedAt = now;
        });
      }
    });
    setDialogVisible(false);
  };

  const handleDelete = (listId: string) => {
    Alert.alert('Delete List', 'This will delete the list but keep the tasks.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await database.write(async () => {
            const list = await listsCollection.find(listId);
            await list.destroyPermanently();
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>Lists</Text>
      </View>

      <FlatList
        data={lists}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[styles.listItem, {borderBottomColor: theme.colors.divider}]}
            onPress={() => navigation.navigate('ListDetail', {listId: item.id})}>
            <View style={[styles.listDot, {backgroundColor: item.color}]} />
            <Text style={[styles.listName, {color: theme.colors.onSurface}]}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => openEditDialog(item)} style={styles.editBtn}>
              <Icon name="pencil-outline" size={18} color={theme.colors.taskComplete} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.editBtn}>
              <Icon name="trash-can-outline" size={18} color={theme.colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />

      <FAB icon="plus" onPress={openCreateDialog} />

      <Dialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        style={{backgroundColor: theme.colors.surface}}>
        <Dialog.Title style={{color: theme.colors.onSurface}}>
          {editingId ? 'Edit List' : 'New List'}
        </Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="List name"
            value={newName}
            onChangeText={setNewName}
            mode="outlined"
            autoFocus
          />
          <Text style={[styles.colorLabel, {color: theme.colors.taskComplete}]}>
            Color
          </Text>
          <View style={styles.colorGrid}>
            {LIST_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setNewColor(c)}
                style={[
                  styles.colorDot,
                  {backgroundColor: c},
                  newColor === c && styles.colorDotSelected,
                ]}>
                {newColor === c && (
                  <Icon name="check" size={14} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
          <Button onPress={handleSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {fontSize: 22, fontWeight: '700'},
  list: {paddingBottom: 80},
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listDot: {width: 14, height: 14, borderRadius: 7, marginRight: 14},
  listName: {flex: 1, fontSize: 16},
  editBtn: {padding: 6, marginLeft: 4},
  colorLabel: {fontSize: 12, fontWeight: '600', marginTop: 16, marginBottom: 8},
  colorGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.3)',
  },
});

export default ListsScreen;
