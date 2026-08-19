import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    refresh(@Body() body: { refreshToken: string }) {
        return this.authService.refresh(body.refreshToken);
    }

    @Post('logout')
    logout(@Body() body: { refreshToken: string }) {
        return this.authService.logout(body.refreshToken);
    }

    @Post('forgot-password')
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('verify-reset-code')
    verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
        return this.authService.verifyResetCode(verifyResetCodeDto);
    }

    @Post('reset-password')
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@Req() req: AuthenticatedRequest) {
        return this.authService.getOne(req.user.userId);
    }

    @Put('me')
    @UseGuards(JwtAuthGuard)
    update(@Body() updateProfileDto: UpdateProfileDto, @Req() req: AuthenticatedRequest) {
        return this.authService.update(req.user.userId, updateProfileDto);
    }
}