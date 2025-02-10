import { Component, OnInit} from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{


  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) { 
  }

  ngOnInit() {
    this.iconRegistry
      .addSvgIcon('back', this.sanitizer.bypassSecurityTrustResourceUrl('icons/back.svg'))
      .addSvgIcon('cancel', this.sanitizer.bypassSecurityTrustResourceUrl('icons/cancel.svg'))
      .addSvgIcon('reset', this.sanitizer.bypassSecurityTrustResourceUrl('icons/reset.svg'))
      .addSvgIcon('settings', this.sanitizer.bypassSecurityTrustResourceUrl('icons/settings.svg'))
      .addSvgIcon('theme', this.sanitizer.bypassSecurityTrustResourceUrl('icons/theme.svg'))
      .addSvgIcon('trash', this.sanitizer.bypassSecurityTrustResourceUrl('icons/trash.svg'))
      .addSvgIcon('trophy', this.sanitizer.bypassSecurityTrustResourceUrl('icons/trophy.svg'));
  }
  
}