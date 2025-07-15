import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Note, NoteService } from '../../service/noteService';
import { MatDialog } from '@angular/material/dialog';
import { AddNoteComponent } from '../add-note/add-note.component';
import { UpdateNoteComponent } from '../update-note/update-note.component';


@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent implements OnInit {
  displayedColumns: string[] = ['image', 'title', 'description', 'status', 'actions'];
  dataSource = new MatTableDataSource<Note>();

  constructor(private noteService: NoteService,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchNotes();
  }

  fetchNotes(): void {
    this.noteService.getAllNotes().subscribe(notes => {
      this.dataSource.data = notes;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

onEdit(id: string): void {
  const noteToEdit = this.dataSource.data.find(n => n.id === id);
  if (!noteToEdit) return;

  const dialogRef = this.dialog.open(UpdateNoteComponent, {
    width: '600px',
    maxHeight: '90vh',
    data: noteToEdit
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.fetchNotes(); // Refresh the list after update
    }
  });
}

  onEnable(id: string): void {
    this.noteService.enableNote(id).subscribe(() => this.fetchNotes());
  }

  onDisable(id: string): void {
    this.noteService.disableNote(id).subscribe(() => this.fetchNotes());
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.noteService.deleteNote(id).subscribe(() => this.fetchNotes());
    }
  }
  openAddDialog(): void {
  const dialogRef = this.dialog.open(AddNoteComponent, {
    width: '600px',     // You can use '80vw' for viewport width if responsive
    height: 'auto',     // Or set fixed height like '500px'
    maxHeight: '90vh',  // Prevent overflow
    panelClass: 'custom-dialog-container' // Optional custom class for styling
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.fetchNotes(); // Refresh table
    }
  });
}

}
