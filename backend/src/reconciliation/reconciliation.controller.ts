import { Controller, Get } from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';

@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly recService: ReconciliationService) {}

  @Get('run')
  async run() {
    return await this.recService.runReconciliation();
  }
}
